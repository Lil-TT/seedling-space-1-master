"use client";

import { useState } from "react";
import MarketRemote from "./MarketRemote";
import ChildhoodPlanet from "./ChildhoodPlanet";

export default function MarketWrapper({ 
  items, 
  children 
}: { 
  items: any[]; 
  children: React.ReactNode 
}) {
  const [isPlanetView, setIsPlanetView] = useState(false);

  return (
    <>
      {/* 遥控器始终悬浮在最上方 */}
      <MarketRemote isPlanetView={isPlanetView} onToggle={() => setIsPlanetView(!isPlanetView)} />

      {/* 3D 星球视图 (点击后显示) */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-1000 ${isPlanetView ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {isPlanetView && <ChildhoodPlanet items={items} />}
      </div>

      {/* 传统的瀑布流列表视图 (默认显示) */}
      <div className={`transition-all duration-700 ${isPlanetView ? "scale-90 opacity-0 blur-md pointer-events-none" : "scale-100 opacity-100"}`}>
        {children}
      </div>
    </>
  );
}