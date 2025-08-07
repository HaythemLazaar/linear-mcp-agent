import { OAuthClientInformation, OAuthMetadata, OAuthTokens, OAuthClientMetadata } from '@modelcontextprotocol/sdk/shared/auth.js'
import { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js'
import { sanitizeUrl } from 'strict-url-sanitise'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Server-side OAuth client provider for MCP using cookies for storage.
 */
export class ServerOAuthClientProvider implements OAuthClientProvider {
  readonly serverUrl: string
  readonly storageKeyPrefix: string
  readonly serverUrlHash: string
  readonly clientName: string
  readonly clientUri: string
  readonly callbackUrl: string
  private request?: NextRequest

  constructor(
    serverUrl: string,
    options: {
      storageKeyPrefix?: string
      clientName?: string
      clientUri?: string
      callbackUrl?: string
      request?: NextRequest
    } = {},
  ) {
    this.serverUrl = serverUrl
    this.storageKeyPrefix = options.storageKeyPrefix || 'mcp:auth'
    this.serverUrlHash = this.hashString(serverUrl)
    this.clientName = options.clientName || 'MCP Server Client'
    this.clientUri = options.clientUri || (typeof window !== 'undefined' ? window.location.origin : '')
    this.callbackUrl = sanitizeUrl(
      options.callbackUrl ||
        (typeof window !== 'undefined' ? new URL('/oauth/callback', window.location.origin).toString() : '/oauth/callback'),
    )
    this.request = options.request
  }

  // --- SDK Interface Methods ---

  get redirectUrl(): string {
    return sanitizeUrl(this.callbackUrl)
  }

  get clientMetadata(): OAuthClientMetadata {
    return {
      redirect_uris: [this.redirectUrl],
      token_endpoint_auth_method: 'none', // Public client
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      client_name: this.clientName,
      client_uri: this.clientUri,
    }
  }

  async clientInformation(): Promise<OAuthClientInformation | undefined> {
    const cookieStore = await cookies()
    const key = this.getKey('client_info')
    const data = cookieStore.get(key)?.value
    if (!data) return undefined
    try {
      return JSON.parse(data) as OAuthClientInformation
    } catch (e) {
      console.warn(`[${this.storageKeyPrefix}] Failed to parse client information:`, e)
      return undefined
    }
  }

  async saveClientInformation(clientInformation: OAuthClientInformation): Promise<void> {
    const cookieStore = await cookies()
    const key = this.getKey('client_info')
    cookieStore.set(key, JSON.stringify(clientInformation), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    const cookieStore = await cookies()
    const key = this.getKey('tokens')
    const data = cookieStore.get(key)?.value
    if (!data) return undefined
    try {
      return JSON.parse(data) as OAuthTokens
    } catch (e) {
      console.warn(`[${this.storageKeyPrefix}] Failed to parse tokens:`, e)
      return undefined
    }
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    const cookieStore = await cookies()
    const key = this.getKey('tokens')
    cookieStore.set(key, JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 3600, // Use token expiry or 1 hour default
    })
    
    // Clean up code verifier and last auth URL after successful token save
    await this.clearCodeVerifier()
    await this.clearLastAuthUrl()
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    const cookieStore = await cookies()
    const key = this.getKey('code_verifier')
    cookieStore.set(key, codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    })
  }

  async codeVerifier(): Promise<string> {
    const cookieStore = await cookies()
    const key = this.getKey('code_verifier')
    const verifier = cookieStore.get(key)?.value
    if (!verifier) {
      throw new Error(
        `[${this.storageKeyPrefix}] Code verifier not found in storage for key ${key}. Auth flow likely corrupted or timed out.`,
      )
    }
    return verifier
  }

  async prepareAuthorizationUrl(authorizationUrl: URL): Promise<string> {
    // Generate a unique state parameter for this authorization request
    const state = crypto.randomUUID()
    const stateKey = this.getKey(`state_${state}`)

    // Store context needed by the callback handler, associated with the state param
    const stateData: StoredState = {
      serverUrlHash: this.serverUrlHash,
      expiry: Date.now() + 1000 * 60 * 10, // State expires in 10 minutes
      providerOptions: {
        serverUrl: this.serverUrl,
        storageKeyPrefix: this.storageKeyPrefix,
        clientName: this.clientName,
        clientUri: this.clientUri,
        callbackUrl: this.callbackUrl,
      },
    }

    const cookieStore = await cookies()
    cookieStore.set(stateKey, JSON.stringify(stateData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    })

    // Add the state parameter to the URL
    authorizationUrl.searchParams.set('state', state)
    const authUrlString = authorizationUrl.toString()

    // Sanitize the authorization URL to prevent XSS attacks
    const sanitizedAuthUrl = sanitizeUrl(authUrlString)

    // Persist the exact auth URL in case manual navigation is needed
    await this.saveLastAuthUrl(sanitizedAuthUrl)

    return sanitizedAuthUrl
  }

  async redirectToAuthorization(authorizationUrl: URL): Promise<void> {
    // For server-side, we don't actually redirect - we return the URL
    // The calling code should handle the redirect
    await this.prepareAuthorizationUrl(authorizationUrl)
  }

  // --- Helper Methods ---

  async getLastAttemptedAuthUrl(): Promise<string | null> {
    const cookieStore = await cookies()
    const key = this.getKey('last_auth_url')
    const storedUrl = cookieStore.get(key)?.value
    return storedUrl ? sanitizeUrl(storedUrl) : null
  }

  private async saveLastAuthUrl(url: string): Promise<void> {
    const cookieStore = await cookies()
    const key = this.getKey('last_auth_url')
    cookieStore.set(key, url, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    })
  }

  private async clearLastAuthUrl(): Promise<void> {
    const cookieStore = await cookies()
    const key = this.getKey('last_auth_url')
    cookieStore.delete(key)
  }

  private async clearCodeVerifier(): Promise<void> {
    const cookieStore = await cookies()
    const key = this.getKey('code_verifier')
    cookieStore.delete(key)
  }

  async clearStorage(): Promise<number> {
    const cookieStore = await cookies()
    const prefixPattern = `${this.storageKeyPrefix}_${this.serverUrlHash}_`
    const statePattern = `${this.storageKeyPrefix}_state_`
    let count = 0

    // Get all cookies and filter by our patterns
    const allCookies = cookieStore.getAll()
    
    for (const cookie of allCookies) {
      const key = cookie.name
      if (key.startsWith(prefixPattern)) {
        cookieStore.delete(key)
        count++
      } else if (key.startsWith(statePattern)) {
        try {
          const value = cookie.value
          if (value) {
            const state = JSON.parse(value) as Partial<StoredState>
            if (state.serverUrlHash === this.serverUrlHash) {
              cookieStore.delete(key)
              count++
            }
          }
        } catch (e) {
          console.warn(`[${this.storageKeyPrefix}] Error parsing state key ${key} during clearStorage:`, e)
        }
      }
    }

    return count
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }

  getKey(keySuffix: string): string {
    return `${this.storageKeyPrefix}_${this.serverUrlHash}_${keySuffix}`
  }

  // Method to get stored state data for callback handling
  async getStoredState(state: string): Promise<StoredState | null> {
    const cookieStore = await cookies()
    const key = this.getKey(`state_${state}`)
    const data = cookieStore.get(key)?.value
    if (!data) return null
    
    try {
      const stateData = JSON.parse(data) as StoredState
      // Check if state has expired
      if (stateData.expiry < Date.now()) {
        cookieStore.delete(key)
        return null
      }
      return stateData
    } catch (e) {
      console.warn(`[${this.storageKeyPrefix}] Failed to parse state data:`, e)
      cookieStore.delete(key)
      return null
    }
  }

  // Method to clear state after successful callback
  async clearState(state: string): Promise<void> {
    const cookieStore = await cookies()
    const key = this.getKey(`state_${state}`)
    cookieStore.delete(key)
  }
}

/**
 * Internal type for storing OAuth state in cookies during the auth flow.
 * @internal
 */
export interface StoredState {
  expiry: number
  metadata?: OAuthMetadata
  serverUrlHash: string
  providerOptions: {
    serverUrl: string
    storageKeyPrefix: string
    clientName: string
    clientUri: string
    callbackUrl: string
  }
}