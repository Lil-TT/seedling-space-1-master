"use client";

import React, { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type Row = {
  dimension: string;
  classScore: number;
  gradeAvg: number;
  fullMark: number;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-slate-100 p-3 rounded-md text-sm shadow-xl border border-slate-600">
        <p className="font-bold mb-1">{payload[0].payload.dimension}</p>
        <p className="text-blue-400">本班指数: {payload[0].value}</p>
        <p className="text-slate-400">年级均值: {payload[1].value}</p>
      </div>
    );
  }
  return null;
};

export default function TeacherEmotionRadar() {
  const [radarData, setRadarData] = useState<Row[]>([]);
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/class-emotion")
      .then((r) => r.json())
      .then((data) => {
        if (data.radarData && Array.isArray(data.radarData)) {
          setRadarData(data.radarData);
          const n = data.sampleSize;
          if (n) {
            setHint(
              `基于近60天数据：本班灵感 ${n.classInspirations ?? 0} 条、倾诉 ${n.classConfessions ?? 0} 条`
            );
          }
        }
      })
      .catch(() =>
        setHint("暂时无法加载班级情绪指数，请稍后重试")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading || radarData.length === 0) {
    return (
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 font-bold text-sm">
          {loading ? "正在加载班级情绪雷达…" : "暂无足够数据生成雷达图"}
        </p>
        {hint && <p className="text-xs text-slate-400 mt-2">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-6">
      <div className="flex-1 h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#cbd5e1" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "#475569", fontSize: 11, fontWeight: 700 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="本班指数"
              dataKey="classScore"
              stroke="#10b981"
              fill="#34d399"
              fillOpacity={0.45}
            />
            <Radar
              name="年级均值"
              dataKey="gradeAvg"
              stroke="#94a3b8"
              fill="#cbd5e1"
              fillOpacity={0.4}
            />
            <Legend />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="lg:w-72 flex flex-col justify-center gap-3 text-sm text-slate-600">
        <p className="font-black text-slate-800 text-base">班级情绪雷达</p>
        <p className="leading-relaxed">
          指数由本班学生的灵感分数、倾诉情绪值与标签关键词等综合估算，年级均值为全校样本对照。
        </p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
