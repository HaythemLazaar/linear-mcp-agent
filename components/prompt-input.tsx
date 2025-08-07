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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { HiOutlineViewGridAdd } from "react-icons/hi";
import { FaGithub, FaGoogleDrive } from "react-icons/fa";
import { TbCube, TbUserSquare } from "react-icons/tb";
import { UseChatHelpers } from "@ai-sdk/react";
import { UIMessage } from "ai";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { LinearAuth } from "./linear-auth";
import { Attachment } from "@/lib/types";

export function PromptInput({
  chatId,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  className,
  isAtBottom = false,
}: {
  chatId: string;
  status: UseChatHelpers<UIMessage>["status"];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers<UIMessage>["setMessages"];
  sendMessage: UseChatHelpers<UIMessage>["sendMessage"];
  className?: string;
  isAtBottom?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const router = useRouter();
  const [input, setInput] = useState<string>("");

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const submitForm = useCallback(() => {
    router.replace(`/projects/${chatId}`);

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
    <div
      className={cn(
        "rounded-lg bg-gradient-to-r from-indigo-300/20 via-indigo-300/15 to-indigo-300/20 backdrop-blur-sm p-1 border border-indigo-300/30 w-full max-w-4xl mx-auto",
        isAtBottom && "pb-0 rounded-b-none"
      )}
    >
      <LinearAuth />
      <div
        className={cn(
          "flex flex-col divide-y divide-neutral-200 w-full border rounded-sm bg-white border-neutral-200 ring ring-neutral-200/20 shadow-sm shadow-indigo-300/50",
          isAtBottom && "rounded-b-none"
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
            className="textarea field-sizing-content max-h-29.5 min-h-12 focus-visible:min-h-24 transition-all resize-none font-medium text-neutral-800 p-1 border-none focus-visible:ring-0 shadow-none placeholder:text-neutral-500 rounded-none"
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
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-6 rounded-sm font-normal tracking-normal text-xs !px-2 text-neutral-800 gap-1 border-neutral-300"
                >
                  <TbUserSquare className="size-3.5" />
                  <span className="">Team</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <HiOutlineViewGridAdd className="size-4 text-neutral-500" />{" "}
                    Add from apps
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>
                        <FaGithub className="size-4 text-neutral-500" /> Github
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FaGoogleDrive className="size-4 text-neutral-500" />{" "}
                        Google Drive
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem>
                  <Paperclip /> Add photos and files
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-6 rounded-sm font-normal tracking-normal text-xs !px-2 text-neutral-800 gap-1 border-neutral-300"
                >
                  <TbCube className="size-3.5" />
                  <span className="">Project</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <HiOutlineViewGridAdd className="size-4 text-neutral-500" />{" "}
                    Add from apps
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>
                        <FaGithub className="size-4 text-neutral-500" /> Github
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FaGoogleDrive className="size-4 text-neutral-500" />{" "}
                        Google Drive
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem>
                  <Paperclip /> Add photos and files
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
            disabled={status !== 'ready'}
          >
            <Paperclip className="size-3.5 text-neutral-900" />
          </Button>
          <Button
            variant="outline"
            className="h-7 bg-indigo-500 text-white hover:text-white hover:bg-indigo-600 border-indigo-600/50 rounded-sm font-medium tracking-normal text-xs"
            onClick={status === "submitted" ? stop : submitForm}
          >
            {status === "submitted" ? "Stop" : !isAtBottom ? "Start" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
