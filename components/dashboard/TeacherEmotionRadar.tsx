"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

// 教师端假数据：将情绪标签（tags）聚合为 5 个核心维度
// classScore: 本班平均分, gradeAvg: 年级平均分
const radarData = [
  { dimension: '学业压力', classScore: 85, gradeAvg: 60, fullMark: 100 }, // 偏高！需注意
  { dimension: '同伴关系', classScore: 90, gradeAvg: 85, fullMark: 100 },
  { dimension: '自我效能', classScore: 65, gradeAvg: 75, fullMark: 100 },
  { dimension: '规则意识', classScore: 80, gradeAvg: 80, fullMark: 100 },
  { dimension: '情绪稳定', classScore: 55, gradeAvg: 70, fullMark: 100 }, // 偏低！需注意
];

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
  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-6">
      
      {/* 左侧：雷达图表区 */}
      <div className="w-full lg:w-2/3 h-80">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-slate-800">班级心理维度对比模型</h3>
          <p className="text-xs text-slate-500">本班 vs 全年级大盘数据实时映射</p>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#cbd5e1" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            
            {/* 年级平均线（灰色背景基准） */}
            <Radar name="年级均值" dataKey="gradeAvg" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.4} />
            {/* 本班数据线（蓝色主视觉） */}
            <Radar name="本班指数" dataKey="classScore" stroke="#3b82f6" fill="#60a5fa" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 右侧：高密度预警看板 (体现教师端专业度) */}
      <div className="w-full lg:w-1/3 flex flex-col justify-center space-y-4 border-l border-slate-200 pl-0 lg:pl-6">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">🔥 系统自动预警</h4>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-md">
          <p className="text-sm font-bold text-red-700">学业压力溢出</p>
          <p className="text-xs text-red-600 mt-1">本班指数(85)显著高于年级均值(60)，建议减少本周课后悬赏任务。</p>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-md">
          <p className="text-sm font-bold text-orange-700">情绪稳定度下滑</p>
          <p className="text-xs text-orange-600 mt-1">近3天“树洞”负面倾诉量上升 12%，请关注留守儿童群体。</p>
        </div>

        <button className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold py-2 rounded transition-colors">
          一键生成干预报告
        </button>
      </div>

    </div>
  );
}