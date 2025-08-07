"use client";

import type { UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useState } from "react";
// import type { Vote } from '@/lib/db/schema';
// import { DocumentToolCall, DocumentToolResult } from './document';
// import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from "./markdown";
// import { MessageActions } from './message-actions';
import { PreviewAttachment } from "./preview-attachment";
// import { Weather } from './weather';
import equal from "fast-deep-equal";
import { cn, sanitizeText } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { MessageEditor } from "./message-editor";
// import { DocumentPreview } from './document-preview';
import { MessageReasoning } from "./message-reasoning";
import type { UseChatHelpers } from "@ai-sdk/react";
import { Loader2, Pencil, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { documentKeys } from "@/hooks/use-document-versions";
import { FaCircleCheck } from "react-icons/fa6";

const PurePreviewMessage = ({
  chatId,
  message,
  isLoading,
  setMessages,
  reload,
  requiresScrollPadding,
}: {
  chatId: string;
  message: UIMessage;
  isLoading: boolean;
  setMessages: UseChatHelpers["setMessages"];
  reload: UseChatHelpers["reload"];
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const queryClient = useQueryClient();
  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message text-base"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            }
          )}
        >
          {/* {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <Sparkles size={14} />
              </div>
            </div>
          )} */}

          <div
            className={cn("flex flex-col gap-4 w-full", {
              "min-h-96": message.role === "assistant" && requiresScrollPadding,
            })}
          >
            {message.experimental_attachments &&
              message.experimental_attachments.length > 0 && (
                <div
                  data-testid={`message-attachments`}
                  className="flex flex-row justify-end gap-2"
                >
                  {message.experimental_attachments.map((attachment) => (
                    <PreviewAttachment
                      key={attachment.url}
                      attachment={attachment}
                    />
                  ))}
                </div>
              )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === "reasoning") {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.reasoning}
                  />
                );
              }

              if (type === "text") {
                if (mode === "view") {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      {message.role === "user" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode("edit");
                              }}
                            >
                              <Pencil size={14} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn("flex flex-col gap-4", {
                          "bg-neutral-200 rounded-2xl rounded-tr-none px-4 py-3":
                            message.role === "user",
                        })}
                      >
                        <Markdown>{sanitizeText(part.text)}</Markdown>
                      </div>
                    </div>
                  );
                }

                if (mode === "edit") {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8" />

                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        reload={reload}
                      />
                    </div>
                  );
                }
              }

              if (type === "tool-invocation") {
                const { toolInvocation } = part;
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === "call") {
                  const { args } = toolInvocation;

                  return (
                    <div
                      key={toolCallId}
                      className="flex items-center gap-2 p-4 bg-neutral-100 ring-1 ring-neutral-200 rounded-md"
                    >
                      <Loader2 className="size-4 animate-spin" />
                      <span className="text-sm font-medium">
                        Calling {toolName}...
                      </span>
                    </div>
                  );
                }

                if (state === "result") {
                  const { result } = toolInvocation;

                  if (toolName === "projectWorkflow") {
                    queryClient.invalidateQueries({
                      queryKey: ["project", chatId],
                    });
                    return (
                      <div
                        key={toolCallId}
                        className="flex flex-col gap-2 bg-neutral-100 ring-1 ring-neutral-200 rounded-md"
                      >
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full p-0"
                          defaultValue="item-1"
                        >
                          <AccordionItem value="item-1">
                            <AccordionTrigger className="px-4 data-[state=open]:border-b border-neutral-200 rounded-b-none">
                              Start a new project
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-4 text-balance p-4">
                              <div className="flex flex-col gap-2 max-w-full overflow-x-auto">
                                <div className="flex items-center gap-2">
                                  <FaCircleCheck />
                                  <h3 className="text-sm font-medium">
                                    Create a project
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaCircleCheck />
                                  <h3 className="text-sm font-medium">
                                    Draft a PRD
                                  </h3>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    );
                  }

                  if (
                    toolName === "createDocumentTool" ||
                    toolName === "updateDocumentTool"
                  ) {
                    queryClient.invalidateQueries({
                      queryKey: documentKeys.lists(),
                    });
                    console.log("Document result:", result);
                    if (result.details?.details?.error)
                      return (
                        <div
                          key={toolCallId}
                          className="p-4 bg-red-100 rounded-md"
                        >
                          <h3 className="text-sm font-medium text-red-800">
                            Error: {result.details.message}
                          </h3>
                        </div>
                      );
                    return (
                      <div key={toolCallId}>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="w-full relative overflow-hidden border border-neutral-200 rounded p-4 bg-white/50 hover:bg-purple-100/50 min-h-20 hover:border-neutral-300 transition-all cursor-pointer group">
                              <h3 className="font-medium text-base text-neutral-900 transition-colors max-w-xs text-left">
                                {result.title}
                              </h3>

                              <div className="absolute -bottom-14 right-4 rotate-4 -space-x-10 flex group-hover:rotate-0 group-hover:-bottom-12 group-hover:scale-105 transition-all duration-300">
                                <div className="aspect-[1/1.414] w-20 bg-white text-white rounded-lg shadow-[1px_0_4px_0px_rgba(0,0,0,0.05)] border border-neutral-200 z-4 group-hover:border-purple-300 transition-all group-hover:shadow-purple-300/20" />
                              </div>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="rounded-none border-0 min-w-screen h-screen bg-neutral-50 overflow-y-auto">
                            <Markdown>{sanitizeText(result.document)}</Markdown>
                          </DialogContent>
                        </Dialog>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={toolCallId}
                      className="flex flex-col gap-2 px-4 bg-neutral-100 ring-1 ring-neutral-200 rounded-md"
                    >
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>{toolName}</AccordionTrigger>
                          <AccordionContent className="flex flex-col gap-4 text-balance">
                            <div className="flex flex-col gap-2 max-w-full overflow-x-auto">
                              <pre className="text-sm">
                                {JSON.stringify(result, null, 2)}
                              </pre>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  );
                }
              }
            })}

            {/* {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )} */}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

    return true;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cn(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <Sparkles size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
