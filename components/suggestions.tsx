"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function Suggestions({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {suggestions.map((prompt) => (
        <SuggestionToken key={prompt} prompt={prompt} onSelect={onSelect} />
      ))}
    </div>
  );
}

function SuggestionToken({
  prompt,
  onSelect,
}: {
  prompt: string;
  onSelect: (prompt: string) => void;
}) {
  return (
    <Button
      variant="outline"
      className="bg-white hover:bg-indigo-100 border-neutral-200 hover:border-indigo-200 rounded-sm font-medium tracking-normal text-[13px] text-neutral-700 hover:text-neutral-900 h-7 gap-3 flex-1"
      onClick={() => onSelect(prompt)}
    >
      {prompt}
      <ChevronRight className="size-4 ml-auto" />
    </Button>
  );
}
