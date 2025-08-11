import { Chat } from "@/components/chat";
import { auth } from "@/lib/auth";
import { memory } from "@/mastra/memory";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

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
  const thread = await memory.query({ threadId: id });
  console.log("THREAD:", thread.messages)
  if (!thread || thread.messages.length === 0) notFound();
  return <Chat id={id} initialMessages={thread.uiMessages} />;
}
