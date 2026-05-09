"use client";

import { SCHOOL_NAME } from "@/lib/school-brand";

type Props = {
  size?: "sm" | "md" | "lg";
  showCaption?: boolean;
  className?: string;
};

export default function SchoolBadge({
  size = "md",
  showCaption = true,
  className = "",
}: Props) {
  const dim =
    size === "lg" ? "w-24 h-24 md:w-32 md:h-32" : size === "sm" ? "w-14 h-14" : "w-20 h-20";

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div
        className={`relative ${dim} shrink-0 drop-shadow-[4px_6px_0_rgba(15,23,42,0.15)]`}
        aria-hidden
      >
        <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="45%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="badgeInner" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>
          </defs>
          <path
            d="M60 8 L108 28 V58 C108 88 60 112 60 112 C60 112 12 88 12 58 V28 Z"
            fill="url(#badgeGrad)"
            stroke="#1e293b"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M60 22 L94 36 V56 C94 78 60 96 60 96 C60 96 26 78 26 56 V36 Z"
            fill="url(#badgeInner)"
            stroke="#1e293b"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <rect x="44" y="38" width="32" height="26" rx="4" fill="#3b82f6" stroke="#1e293b" strokeWidth="2.5" />
          <path d="M52 44 H68 M52 52 H76 M52 60 H64" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="78" r="6" fill="#ef4444" stroke="#1e293b" strokeWidth="2" />
        </svg>
      </div>
      {showCaption && (
        <p className="text-[10px] md:text-xs font-black text-slate-800 tracking-tight text-center leading-tight max-w-[7rem]">
          {SCHOOL_NAME}
          <br />
          <span className="text-amber-700">校徽</span>
        </p>
      )}
    </div>
  );
}
