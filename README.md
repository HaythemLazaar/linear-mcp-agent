<img width="1919" height="1079" alt="Screenshot 2025-08-11 202229" src="https://github.com/user-attachments/assets/6c662f7a-9eec-41b6-81bb-4642190825ec" />
<h1 align="center">Linear-mcp-agent</h1>

<p align="center">
  An AI agent that helps you manage your Linear projects.
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#features"><strong>Deploy Your Own</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#getting-started"><strong>Setting Up Locally</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a> ·
  <a href="#license"><strong>License</strong></a>
</p>
<br/>

## Introduction

This is an AI agent built with [Mastra](https://mastra.io), the [Vercel AI SDK](https://sdk.vercel.ai/docs) with [Linear](https://linear.app) MCP tools to help you with project management, it uses Google Gemini `gemini-1.5-pro` models. The agent can create and view issues, projects, and more within Linear.

## Features

- **Use linear MCP tools:** Use the official linear 20+ MCP tools like: (list_issues, create_issue, list_teams...).
- **Extensible:** Built on Mastra, allowing for new tools and capabilities to be added easily.
- **Open-Source:** Available under the Apache 2.0 license.

## Tech Stack

- [Next.js](https://nextjs.org/) – React framework for building the user interface.
- [Shadcn](https://ui.shadcn.com/) - The React & tailwind UI component library
- [Mastra](https://mastra.ai) – The underlying framework for the self-operating agent.
- [Vercel AI SDK](https://sdk.vercel.ai/docs) – For building the AI-powered chat interface.

## Getting Started

To get started, you can clone the repository and install the dependencies:

```bash
git clone <your-repo-url>
cd <your-repo-name>
pnpm install
```

You will also need to set up your environment variables. Copy the `.env.example` file to `.env` and fill in the required values.

Then, you can run the development server:

```bash
pnpm dev
```

## Contributing

- [Open an issue](https://github.com/HaythemLazaar/linear-mcp-agent/issues) if you believe you've encountered a bug.
- Make a [pull request](https://github.com/HaythemLazaar/linear-mcp-agent/pull) to add new features/make quality-of-life improvements/fix bugs.

## License

This project is licensed under the [Apache 2.0 license](https://github.com/HaythemLazaar/linear-mcp-agent/blob/main/LICENSE).
