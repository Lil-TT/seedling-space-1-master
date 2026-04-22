"use client";

export default function MarketRemote({ 
  isPlanetView, 
  onToggle 
}: { 
  isPlanetView: boolean; 
  onToggle: () => void 
}) {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60]">
      <div className="bg-slate-200 border-4 border-slate-300 p-3 rounded-[2rem] shadow-[0_10px_0_rgba(148,163,184,1)] flex items-center gap-6">
        
        {/* LCD 小屏幕 */}
        <div className="bg-slate-900 px-4 py-2 rounded-xl shadow-inner border-2 border-slate-700 w-32 text-center">
          <span className="text-[10px] font-mono font-black tracking-widest text-emerald-400 animate-pulse">
            {isPlanetView ? "ORBITING..." : "READY."}
          </span>
        </div>

        {/* MENU 切换大按钮 */}
        <button 
          onClick={onToggle}
          className={`px-8 py-3 rounded-2xl font-black text-lg transition-all ${
            isPlanetView 
              ? "bg-rose-400 text-rose-950 border-4 border-rose-600 shadow-[0_4px_0_rgba(159,18,57,1)] active:translate-y-1 active:shadow-none" 
              : "bg-amber-400 text-amber-950 border-4 border-amber-600 shadow-[0_6px_0_rgba(180,83,9,1)] active:translate-y-1 active:shadow-none hover:bg-amber-300"
          }`}
        >
          {isPlanetView ? "返回地面" : "探索宇宙 🚀"}
        </button>
      </div>
    </div>
  );
}