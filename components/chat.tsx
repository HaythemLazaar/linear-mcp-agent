"use client";

import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { generateUUID } from "@/lib/utils";
import { PromptInput } from "./prompt-input";
import { Messages } from "./messages";
import { cn } from "@/lib/utils";
import { Attachment } from "@/lib/types";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
}) {
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
  } = useChat({
    id,
    experimental_throttle: 100,
    generateId: generateUUID,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            messages,
            ...body,
          },
        };
      },
    }),
    onError: (error) => {
      console.error(error);
    },
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/linear/status");
        const data = await response.json();
        if (data.authenticated) {
          setAuthError(null);
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
      }
    };

    checkAuth();
  }, []);

  return (
    <div
      className={cn(
        "flex-1 h-full min-h-full max-h-[calc(100vh-3rem)] overflow-y-auto flex flex-col relative transition-all"
      )}
    >
      <div
        className={cn(
          "flex flex-col min-w-0 flex-1 relative max-w-3xl mx-auto w-full",
          messages.length === 0 && "justify-center"
        )}
      >
        <Messages
          chatId={id}
          status={status}
          messages={messages}
          setMessages={setMessages}
          regenerate={regenerate}
          authError={authError}
        />
        <form className={cn("sticky bottom-0 max-w-3xl mx-auto w-full")}>
          <PromptInput
            chatId={id}
            status={status}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            sendMessage={sendMessage}
            isAtBottom
          />
        </form>
      </div>
    </div>
  );
}
