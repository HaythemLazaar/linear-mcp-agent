import { Chat } from "@/components/chat";
import { mastra } from "@/mastra";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const thread = await mastra.getMemory()?.query({ threadId: id });

  return <Chat id={id} initialMessages={thread?.uiMessages || []} />;
}
