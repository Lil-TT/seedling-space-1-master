"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function shuffleValid(start: number[]): number[] {
  let board = [...start];
  for (let i = 0; i < 120; i++) {
    const zi = board.indexOf(0);
    const row = Math.floor(zi / 3);
    const col = zi % 3;
    const neighbors: number[] = [];
    if (row > 0) neighbors.push(zi - 3);
    if (row < 2) neighbors.push(zi + 3);
    if (col > 0) neighbors.push(zi - 1);
    if (col < 2) neighbors.push(zi + 1);
    const j = neighbors[Math.floor(Math.random() * neighbors.length)];
    [board[zi], board[j]] = [board[j], board[zi]];
  }
  return board;
}

export default function TilePuzzle({
  onSolved,
}: {
  onSolved?: () => void | Promise<void>;
}) {
  const [board, setBoard] = useState(() => shuffleValid(SOLVED));
  const [moves, setMoves] = useState(0);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);
  const claimedRef = useRef(false);

  const startGame = useCallback(() => {
    setMoves(0);
    setRewardMsg(null);
    claimedRef.current = false;
    setBoard(shuffleValid(SOLVED));
  }, []);

  const solved =
    board.length === 9 && board.every((v, i) => v === SOLVED[i]);

  useEffect(() => {
    if (!solved || claimedRef.current) return;
    claimedRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/puzzle/reward", { method: "POST" });
        const data = await res.json();
        if (!cancelled) {
          setRewardMsg(data.message || (res.ok ? "太棒了！" : data.error));
          await onSolved?.();
        }
      } catch {
        if (!cancelled) setRewardMsg("网络错误");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [solved, onSolved]);

  const tryMove = (index: number) => {
    if (solved) return;
    const zi = board.indexOf(0);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const zr = Math.floor(zi / 3);
    const zc = zi % 3;
    const dist = Math.abs(row - zr) + Math.abs(col - zc);
    if (dist !== 1) return;
    const next = [...board];
    [next[index], next[zi]] = [next[zi], next[index]];
    setBoard(next);
    setMoves((m) => m + 1);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="grid grid-cols-3 gap-2 aspect-square">
        {board.map((n, i) => (
          <button
            key={i}
            type="button"
            disabled={n === 0 || solved}
            onClick={() => tryMove(i)}
            className={`rounded-2xl text-2xl font-black border-4 border-slate-900 shadow-[4px_4px_0_rgba(15,23,42,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
              n === 0
                ? "bg-slate-200/50 border-dashed text-transparent cursor-default"
                : "bg-gradient-to-br from-emerald-100 to-teal-200 text-slate-900 hover:-translate-y-0.5"
            }`}
          >
            {n || ""}
          </button>
        ))}
      </div>
      <div className="flex justify-between items-center text-sm font-bold text-slate-600 px-1">
        <span>步数：{moves}</span>
        <button
          type="button"
          onClick={startGame}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black"
        >
          打乱重玩
        </button>
      </div>
      {solved && rewardMsg && (
        <p className="text-center font-black text-emerald-700">{rewardMsg}</p>
      )}
    </div>
  );
}
