"use client";

import { PromptInput } from "@/components/chat-input";
import { Button } from "@/components/ui/button";
import { generateUUID } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Attachment } from "ai";

export const Greeting = ({ id }: { id: string }) => {
  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    id,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    api: "/api/chat",
    onError: (error) => {
      console.error(error);
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      append({
        role: "user",
        content: query,
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, append, hasAppendedQuery, id]);

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      <h1 className="text-xl font-medium text-neutral-900 tracking-tighter">
        Welcome Haythem, what are you planning to build?
      </h1>

      <PromptInput
        projectId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        messages={messages}
        setMessages={setMessages}
        append={append}
        handleSubmit={handleSubmit}
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="bg-white hover:bg-indigo-100 border-neutral-200 hover:border-indigo-200 rounded-sm font-medium tracking-normal text-[13px] text-neutral-700 hover:text-neutral-900 h-7 gap-3 flex-1"
        >
          {/* <TbCircleSquare className="size-4 bg-indigo-100 ring-4 ring-indigo-100 rounded-full" /> */}
          Collborate on a new project
          <ChevronRight className="size-4 ml-auto" />
        </Button>
        <Button
          variant="outline"
          className="bg-white hover:bg-amber-100 border-neutral-200 hover:border-amber-200 rounded-sm font-medium tracking-normal text-[13px] text-neutral-700 hover:text-neutral-900 h-7 gap-3 flex-1"
        >
          {/* <TbBoxMultiple className="size-4 bg-amber-100 ring-4 ring-amber-100 rounded-full" /> */}
          Help me with an issue
          <ChevronRight className="size-4 ml-auto" />
        </Button>
        <Button
          variant="outline"
          className="bg-white hover:bg-indigo-100 border-neutral-200 hover:border-indigo-200 rounded-sm font-medium tracking-normal text-[13px] text-neutral-700 hover:text-neutral-900 h-7 gap-3 flex-1"
        >
          {/* <TbCircleSquare className="size-4 bg-indigo-100 ring-4 ring-indigo-100 rounded-full" /> */}
          Document an existing project
          <ChevronRight className="size-4 ml-auto" />
        </Button>
        <Button
          variant="outline"
          className="bg-white hover:bg-fuchsia-100 border-neutral-200 hover:border-fuchsia-200 rounded-sm font-medium tracking-normal text-[13px] text-neutral-700 hover:text-neutral-900 h-7 gap-3 flex-1"
        >
          {/* <TbInfoSquareRounded className="size-4 bg-fuchsia-100 ring-4 ring-fuchsia-100 rounded-full" /> */}
          Create a PRD
          <ChevronRight className="size-4 ml-auto" />
        </Button>
      </div>
    </div>
  );
};
