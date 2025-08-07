import type { UIMessage } from "ai";
import { PreviewMessage, ThinkingMessage } from "./message";
import { Greeting } from "./greeting";
import { memo } from "react";
import equal from "fast-deep-equal";
import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { useMessages } from "@/hooks/use-messages";
import { cn } from "@/lib/utils";
import { LinearAuth } from "./linear-auth";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers["status"];
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers["setMessages"];
  reload: UseChatHelpers["reload"];
  authError: string | null;
}

function PureMessages({
  chatId,
  status,
  messages,
  setMessages,
  reload,
  authError,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({
    chatId,
    status,
  });

  return (
    <div
      ref={messagesContainerRef}
      className={cn(
        "flex flex-col min-w-0 gap-6 flex-1 pt-4 relative",
        messages.length === 0 && "justify-center"
      )}
    >
      {/* {messages.length === 0 && <Greeting />} */}

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={status === "streaming" && messages.length - 1 === index}
          setMessages={setMessages}
          reload={reload}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
        />
      ))}

      {authError && (
        <div className="w-full mx-auto max-w-3xl px-4">
          <Alert>
            <AlertDescription className="w-full [&>div]:pt-2">
              <LinearAuth />
            </AlertDescription>
          </Alert>
        </div>
      )}

      {status === "submitted" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && <ThinkingMessage />}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;

  return true;
});
