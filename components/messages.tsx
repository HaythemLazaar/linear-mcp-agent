import type { UIMessage } from "ai";
import { PreviewMessage, ThinkingMessage } from "./message";
import { memo, useEffect, useState } from "react";
import equal from "fast-deep-equal";
import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { useMessages } from "@/hooks/use-messages";
import { cn } from "@/lib/utils";
import { LinearAuth } from "./linear-auth";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { ArrowDown } from "lucide-react";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers<UIMessage>["status"];
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers<UIMessage>["setMessages"];
  regenerate: UseChatHelpers<UIMessage>["regenerate"];
  authError: string | null;
}

function PureMessages({
  chatId,
  status,
  messages,
  setMessages,
  regenerate,
  authError,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    onViewportEnter,
    onViewportLeave,
    scrollToBottom,
  } = useScrollToBottom();

  const [hasSentMessage, setHasSentMessage] = useState(false);

  useEffect(() => {
    if (chatId) {
      scrollToBottom("instant");
      setHasSentMessage(false);
    }
  }, [chatId, scrollToBottom]);

  useEffect(() => {
    if (status === "submitted" || status === "streaming") {
      setHasSentMessage(true);
      if (isAtBottom) scrollToBottom();
    } else setHasSentMessage(false);
  }, [status, messages]);

  return (
    <div
      ref={messagesContainerRef}
      className={cn(
        "flex flex-col min-w-0 gap-6 flex-1 pt-4 relative",
        messages.length === 0 && "justify-center"
      )}
    >
      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          // isLoading={status === "streaming" && messages.length - 1 === index}
          setMessages={setMessages}
          regenerate={regenerate}
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

      <Button
        variant="outline"
        size="icon"
        className={cn(
          "sticky bottom-56 rounded-full shadow-2xl mx-auto transition-all border-indigo-200 text-indigo-700",
          isAtBottom ? "opacity-0 absolute" : "opacity-100"
        )}
        onClick={() => scrollToBottom()}
      >
        <ArrowDown />
      </Button>

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
