"use client";
import { Button } from "@/components/ui/button";
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { UseChatHelpers } from "@ai-sdk/react";
import { UIMessage } from "ai";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { LinearAuth } from "./linear-auth";
import { Attachment } from "@/lib/types";
import { LinearObjectsCombobox } from "./linear-objects-combobox";
import { Suggestions } from "./suggestions";

export function PromptInput({
  chatId,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  sendMessage,
  className,
}: {
  chatId: string;
  status: UseChatHelpers<UIMessage>["status"];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  sendMessage: UseChatHelpers<UIMessage>["sendMessage"];
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const router = useRouter();
  const [input, setInput] = useState<string>("");

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const submitForm = useCallback(() => {
    sendMessage({
      role: "user",
      parts: [
        ...attachments.map((attachment) => ({
          type: "file" as const,
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        {
          type: "text",
          text: input,
        },
      ],
    });

    setAttachments([]);
    setInput("");

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    input,
    setInput,
    attachments,
    sendMessage,
    setAttachments,
    width,
    chatId,
    router,
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error("Failed to upload file, please try again!");
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments]
  );

  return (
    <div className="relative w-full flex flex-col gap-4 max-w-4xl mx-auto">
      <div
        className={cn(
          "rounded-lg bg-gradient-to-r from-indigo-300/20 via-indigo-300/15 to-indigo-300/20 backdrop-blur-sm p-1 border border-indigo-300/30 w-full",
          messages.length > 0 && "pb-0 rounded-b-none"
        )}
      >
        <LinearAuth />
        <div
          className={cn(
            "flex flex-col divide-y divide-neutral-200 w-full border rounded-sm bg-white border-neutral-200 ring ring-neutral-200/20 shadow-sm shadow-indigo-300/50",
            messages.length > 0 && "rounded-b-none"
          )}
        >
          <div
            className={cn(
              " p-3 gap-2 flex flex-col relative transition-colors ",
              className
            )}
          >
            <Textarea
              data-testid="multimodal-input"
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              placeholder="Tell me your goal..."
              className="textarea field-sizing-content max-h-29.5 min-h-12 focus-visible:min-h-24 transition-all resize-none font-medium text-neutral-800 p-0 border-none focus-visible:ring-0 shadow-none placeholder:text-neutral-500 rounded-none"
              style={{
                scrollbarWidth: "thin",
              }}
              rows={2}
              autoFocus
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();

                  if (status !== "ready") {
                    toast.error(
                      "Please wait for the model to finish its response!"
                    );
                  } else {
                    submitForm();
                  }
                }
              }}
            />
            <LinearObjectsCombobox />
          </div>
          <div className="flex items-center justify-between p-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 px-2"
              onClick={(event) => {
                event.preventDefault();
                fileInputRef.current?.click();
              }}
              disabled={status !== "ready"}
            >
              <Paperclip className="size-3.5 text-neutral-900" />
            </Button>
            <Button
              variant="outline"
              className="h-7 bg-indigo-500 text-white hover:text-white hover:bg-indigo-600 border-indigo-600/50 rounded-sm font-medium tracking-normal text-xs"
              onClick={status === "submitted" ? stop : submitForm}
              disabled={input.trim() === "" && attachments.length === 0}
            >
              {status === "submitted"
                ? "Stop"
                : messages.length === 0
                  ? "Start"
                  : "Send"}
            </Button>
          </div>
        </div>
      </div>
      {messages.length === 0 && (
        <Suggestions
          suggestions={DEFAULT_SUGGESTIONS}
          onSelect={(prompt) =>
            sendMessage({
              role: "user",
              parts: [{ type: "text", text: prompt }],
            })
          }
        />
      )}
    </div>
  );
}

const DEFAULT_SUGGESTIONS = [
  "Help me with an issue",
  "Document an existing project",
  "Create a new project",
  "Create a new issue",
];
