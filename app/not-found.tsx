import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linear MCP Agent - Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center">
      <h1>404 - Page Not Found</h1>
      <p>This page does not exist.</p>
    </div>
  );
}
