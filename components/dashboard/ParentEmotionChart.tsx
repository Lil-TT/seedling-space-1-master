"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// 这里的假数据后续会替换为你通过 Prisma 查出来的真实数据
const weeklyData = [
  { day: "周一", score: 2, note: "有点困" },
  { day: "周二", score: 5, note: "被老师表扬了！" },
  { day: "周三", score: -4, note: "和好朋友吵架了" },
  { day: "周四", score: 0, note: "平静的一天" },
  { day: "周五", score: 8, note: "马上周末啦，期待去动物园" },
  { day: "周六", score: 9, note: "看到了长颈鹿！" },
  { day: "周日", score: 3, note: "作业还没写完..." },
];

// 自定义提示框，让 UI 更符合温情监控的调性
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-orange-100 shadow-xl">
        <p className="font-bold text-slate-700">{label}</p>
        <p className="text-sm text-orange-500 font-medium my-1">
          情绪指数: {data.score > 0 ? `+${data.score}` : data.score}
        </p>
        <p className="text-xs text-slate-500 italic">"{data.note}"</p>
      </div>
    );
  }
  return null;
};

export default function ParentEmotionChart() {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-6 rounded-3xl shadow-sm border border-white">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800">一周情绪心电图</h3>
        <p className="text-sm text-slate-500">孩子近期的心情起伏轨迹</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {/* 隐藏刻度线，让界面更干净 */}
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis domain={[-10, 10]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#fdba74', strokeWidth: 2, strokeDasharray: '5 5' }} />
            
            {/* 情绪基准线 (0分零界线) */}
            <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
            
            {/* 核心波浪线：使用 natural 产生平滑的物理曲线 */}
            <Line
              type="natural"
              dataKey="score"
              stroke="#f97316"
              strokeWidth={4}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#f97316' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#f97316' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}