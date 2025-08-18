"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Markdown } from "./markdown";
import { ChevronDown } from "lucide-react";

interface MessageReasoningProps {
  reasoning: string;
}

export function MessageReasoning({ reasoning }: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: "0.5rem",
    },
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-2 items-center">
        <div className="font-medium">Reasoned for a few seconds</div>
        <button
          data-testid="message-reasoning-toggle"
          type="button"
          className="cursor-pointer"
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          <ChevronDown />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            data-testid="message-reasoning"
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4"
          >
            <Markdown>{reasoning}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
