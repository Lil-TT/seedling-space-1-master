import { Suspense } from "react";
import GuestEntryWizard from "./GuestEntryWizard";

function GuestFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl border-4 border-slate-900 bg-amber-200 animate-pulse" />
        <p className="font-black text-slate-600">加载访客通道…</p>
      </div>
    </div>
  );
}

export default function GuestPage() {
  return (
    <Suspense fallback={<GuestFallback />}>
      <GuestEntryWizard />
    </Suspense>
  );
}
