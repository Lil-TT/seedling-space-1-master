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

  // 处理 3D 卫星点击降落
  const handlePlanetItemSelect = (itemId: string) => {
    setIsPlanetView(false); // 1. 返回地面

    // 2. 延迟 600ms (等待模糊淡出动画结束) 后派发事件
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("market-item-select", { detail: itemId }));
    }, 600);
  };

  return (
    <>
      <MarketRemote isPlanetView={isPlanetView} onToggle={() => setIsPlanetView(!isPlanetView)} />

      <div className={`fixed inset-0 z-40 transition-opacity duration-1000 ${isPlanetView ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {isPlanetView && <ChildhoodPlanet items={items} onSelectItem={handlePlanetItemSelect} />}
      </div>

      <div className={`transition-all duration-700 ${isPlanetView ? "scale-90 opacity-0 blur-md pointer-events-none" : "scale-100 opacity-100"}`}>
        {children}
      </div>
    </>
  );
}