"use server";
import { mastra } from "@/mastra";

export async function getUserThreads(resourceId: string) {
  return await mastra.getStorage()?.getThreadsByResourceId({
    resourceId,
  });
}

export async function getThread(threadId: string) {
  return await mastra.getMemory()?.query({ threadId });
}
