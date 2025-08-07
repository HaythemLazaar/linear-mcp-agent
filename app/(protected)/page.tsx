import { Greeting } from "@/components/greeting";
import { generateUUID } from "@/lib/utils";

export default function Home() {
  const id = generateUUID();
  return (
    <div className="flex-1 flex flex-col justify-center">
      <Greeting id={id} />
    </div>
  );
}
