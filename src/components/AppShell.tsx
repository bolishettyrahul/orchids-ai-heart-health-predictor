"use client";

import { Sidebar } from "./Navigation";
import { CommandMenu } from "./CommandMenu";
import { useCommand } from "@/context/CommandContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useCommand();

  return (
    <div className="min-h-screen bg-[#030712] selection:bg-cyan-500/30 selection:text-cyan-200">
      <Sidebar />
      <div className="pl-24">
        {children}
      </div>
      <CommandMenu open={open} setOpen={setOpen} />
    </div>
  );
}
