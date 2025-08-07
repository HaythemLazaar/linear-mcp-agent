import { Chat } from "@/components/chat";
import { auth } from "@/lib/auth";
import { mastra } from "@/mastra";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }
  const { id } = await params;
  const thread = await mastra.getMemory()?.query({ threadId: id });

  return <Chat id={id} initialMessages={thread?.uiMessages || []} />;
}
