// components/animations/DashboardAssets.tsx
"use client";

import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

// 统一的 Rive 播放器组件
export function RivePlayer({ src, className }: { src: string; className?: string }) {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
  });

  return <RiveComponent className={className} />;
}