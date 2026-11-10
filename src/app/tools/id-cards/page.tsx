import type { Metadata } from "next";
import IdCardMaker from "./IdCardMaker";

export const metadata: Metadata = { title: "ID card maker" };

export default function Page() {
  return (
    <div>
      <div className="no-print">
        <h1 className="text-3xl font-black text-zinc-50 sm:text-4xl">ID cards and passes</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">Fill in the event, add people, then print. Cards are credit-card size, two across on A4. Everything stays in your browser.</p>
      </div>
      <IdCardMaker />
    </div>
  );
}
