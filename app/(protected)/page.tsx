import { Chat } from "@/components/chat";
import { generateUUID } from "@/lib/utils";

export default function Home() {
  const id = generateUUID();
  return (
    <div className="flex-1 flex flex-col justify-center">
      <Chat id={id} />
    </div>
  );
}
