"use client";

import { APICallError, DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { generateUUID } from "@/lib/utils";
import { PromptInput } from "./prompt-input";
import { Messages } from "./messages";
import { cn } from "@/lib/utils";
import { Attachment } from "@/lib/types";
import { useLinearObjects } from "@/hooks/use-linear-objects";
import { useRouter } from "next/navigation";
import { Suggestions } from "./suggestions";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages?: Array<UIMessage>;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const { refresh, replace } = useRouter();
  const { team, project } = useLinearObjects();
  const { messages, setMessages, sendMessage, status, stop, regenerate } =
    useChat({
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
              message: messages.at(-1),
              team,
              project,
              ...body,
            },
          };
        },
      }),
      onError: (error) => {
        console.error(error);
        refresh();

        if (APICallError.isInstance(error)) {
          // Handle the error
          alert("EEEE");
        }
      },
      onFinish: () => {
        if (!initialMessages) {
          queryClient.invalidateQueries({
            queryKey: ["threads", user?.id],
          });
          replace(`/chat/${id}`);
        }
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
          "flex flex-col min-w-0 flex-1 relative w-full",
          messages.length === 0
            ? "justify-center max-w-4xl mx-auto gap-4"
            : "max-w-3xl mx-auto"
        )}
      >
        {messages.length === 0 && (
          <h1 className="text-xl font-medium text-neutral-900 tracking-tighter">
            Welcome, what are you planning to build?
          </h1>
        )}
        {messages.length > 0 && (
          <Messages
            chatId={id}
            status={status}
            messages={messages}
            setMessages={setMessages}
            regenerate={regenerate}
            authError={authError}
          />
        )}
        <form className={cn("sticky bottom-0 w-full")}>
          <PromptInput
            chatId={id}
            status={status}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            sendMessage={sendMessage}
          />
        </form>
      </div>
    </div>
  );
}
