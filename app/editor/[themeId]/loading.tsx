import React from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function EditorLoading() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-muted-foreground gap-4 animate-in fade-in duration-500">
      <LoadingSpinner size="lg" />
      <span className="text-xs font-mono font-bold tracking-wider uppercase">Loading Workbench...</span>
    </div>
  );
}
