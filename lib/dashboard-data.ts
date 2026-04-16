// lib/dashboard-data.ts

// 四大核心卡片数据
export const coreCardsData = [
    {
        title: "活动大厅",
        description: "参与高年级活动与家庭共创，接取最新任务。",
        bgColor: "morandi-blue",
        textColor: "white",
        link: "/activities",
        linkText: "探索活动 →"
    },
    {
        title: "童心市场",
        description: "发布闲置物品，用你的铅笔与书本交换心愿。",
        bgColor: "morandi-yellow",
        textColor: "slate-800",
        link: "/market",
        linkText: "去逛逛 →"
    },
    {
        title: "成长生态",
        description: "在树洞倾诉心情，培育你的专属成长树。",
        bgColor: "morandi-green",
        textColor: "white",
        link: "/growth",
        linkText: "查看心情 →"
    },
    {
        title: "成果展览馆",
        description: "展示你的交易记录与成长勋章墙。",
        bgColor: "morandi-red",
        textColor: "white",
        link: "/achievements",
        linkText: "我的主页 →"
    },
    {
        title: "成果展览馆",
        description: "展示你的交易记录与成长勋章墙。",
        bgColor: "morandi-red",
        textColor: "white",
        link: "/achievements",
        linkText: "我的主页 →"
    },
    {
        title: "成果展览馆",
        description: "展示你的交易记录与成长勋章墙。",
        bgColor: "morandi-red",
        textColor: "white",
        link: "/achievements",
        linkText: "我的主页 →"
    }
];

// Callout 区域成果描述数据
export const achievementsData = [
    "Fast, high-quality insights",
    "One seamless project lead",
    "Built for multi-market studies"
];

// lib/dashboard-data.ts

export const assetConfigs = [
  // ==========================================
  // Rive 动画资产 (.riv)
  // ==========================================
  // Hero 动画 (通常放在顶部容器，按原始 HTML 不带绝对坐标，这里作独立占位)
  { type: "riv", name: "hero_animation", className: "w-full h-full" },
  
  // 核心视差 Rive 资产
  { type: "riv", name: "climber", className: "absolute z-10 aspect-[1000/1225] max-md:top-[2.8%] max-md:left-[-16%] max-md:w-[68%] md:top-[10%] md:left-[-3.2%] md:w-[43%]" },
  { type: "riv", name: "shrug", className: "absolute z-10 aspect-[1153/1188] max-md:top-[20%] max-md:right-[-3%] max-md:w-[72%] max-sm:right-[-6.5%] md:top-[19%] md:right-[5%] md:w-[45%]" },
  { type: "riv", name: "composer", className: "absolute z-10 aspect-[1000/1151] max-md:top-[35.5%] max-md:right-[-15.5%] max-md:w-[68%] md:top-[32%] md:right-[-5%] md:w-[40%]" },
  { type: "riv", name: "trumpeter_1", className: "pointer-events-none absolute z-10 aspect-[808/738] max-md:top-[38%] max-md:left-[-7%] max-md:w-[56%] md:top-[33.4%] md:left-[14%] md:w-[32%] xl:w-[29%]" },
  { type: "riv", name: "trumpeter_2", className: "absolute z-20 aspect-square max-md:top-[41.5%] max-md:left-[-4%] max-md:w-[54%] md:top-[35.5%] md:left-[-2%] md:w-[32%] xl:w-[29%]" },
  { type: "riv", name: "gamer", className: "absolute z-10 aspect-square max-md:top-[55.5%] max-md:left-[-3%] max-md:w-[72%] md:top-[45.35%] md:left-[11.5%] md:w-[31%] xl:top-[44.7%] xl:left-[10%] xl:w-[33.5%]" },
  { type: "riv", name: "scientist", className: "absolute right-[0] z-20 aspect-[1000/1271] max-md:top-[61%] max-md:w-[68%] md:top-[53%] md:w-[34%]" },
  { type: "riv", name: "soccer", className: "absolute z-20 aspect-[1789/1438] max-md:top-[81%] max-md:right-[-5%] max-md:w-[100%] md:top-[63%] md:left-[-3.5%] md:w-[56.5%]" },
  { type: "riv", name: "binoculars", className: "absolute z-10 aspect-[1789/1438] max-md:right-[-16%] max-md:bottom-[2%] max-md:w-[73%] md:right-[-8.5%] md:bottom-[2%] md:w-[60%]" },
  { type: "riv", name: "unicycle", className: "absolute z-10 aspect-[1694/1594] max-md:bottom-[8%] max-md:left-[16%] max-md:w-[70%] md:bottom-[5%] md:left-[22%] md:w-[54%]" },
  { type: "riv", name: "basketball_player", className: "absolute z-10 aspect-[1608/1608] max-md:bottom-[4%] max-md:left-[-15%] max-md:w-[58%] md:bottom-[10%] md:left-[-5%] md:w-[44%]" },

  // ==========================================
  // SVG 静态与视差资产 (.svg)
  // ==========================================
  
  // 钟表相关
  { type: "svg", name: "clock", speed: 0.05, className: "absolute z-20 max-md:top-[1.5%] max-md:left-[15%] max-md:hidden max-md:w-[16%] max-md:transform-none! md:top-[5%] md:left-[13%] md:w-[10%]" },
  { type: "svg", name: "clock-shape", className: "absolute top-[2%] left-[8%] z-10 w-[30%] max-md:hidden" },
  { type: "svg", name: "clock-shape-mobile", className: "absolute top-[1%] left-[8%] z-10 hidden w-[40%]" },

  // 文件夹相关
  { type: "svg", name: "folder", speed: 0.02, className: "absolute z-20 max-md:top-[20%] max-md:left-[16%] max-md:w-[20%] max-md:transform-none! md:top-[22%] md:left-[40%] md:w-[12%]" },
  { type: "svg", name: "folder-shape", className: "absolute z-20 max-md:top-[17%] max-md:left-[-18%] max-md:w-[42%] md:top-[15%] md:left-[19%] md:w-[25%]" },

  // 飞机相关 (原始 HTML 包含动画起止变量，交给 GSAP 处理视差即可)
  { type: "svg", name: "plane-1", className: "absolute z-10 max-md:top-[4.5%] max-md:left-[50%] max-md:w-[12%] max-md:transform-none! md:top-[11%] md:left-[31%] md:w-[6%]" },
  { type: "svg", name: "plane-2", className: "absolute z-20 max-md:top-[8.5%] max-md:right-[1%] max-md:w-[16%] max-md:transform-none! md:top-[19%] md:left-[46%] md:w-[8%]" },
  { type: "svg", name: "plane-trace", className: "absolute z-10 max-md:top-[2.9%] max-md:left-[28%] max-md:w-[50%] md:top-[9%] md:left-[22%] md:w-[23%]" },
  { type: "svg", name: "sheet", speed: 0.05, className: "absolute z-20 max-md:top-[19%] max-md:left-[2%] max-md:w-[18%] max-md:transform-none! md:top-[20%] md:left-[32%] md:w-[10%]" },

  // 音乐与小号相关
  { type: "svg", name: "composer-shape", speed: 0.15, className: "absolute top-[26%] right-[9%] z-10 w-[38%] max-md:hidden max-md:transform-none!" },
  { type: "svg", name: "composer-shape-2", className: "absolute top-[26%] right-[9%] z-20 w-[38%] max-md:hidden max-md:transform-none!" },
  { type: "svg", name: "music-note-1", speed: 0.05, className: "pointer-events-none absolute max-md:top-[36.5%] max-md:left-[16%] max-md:w-[12%] max-md:transform-none! md:top-[34%] md:left-[9%] md:w-[5%] xl:w-[6.5%]" },
  { type: "svg", name: "music-note-2", speed: 0.08, className: "absolute z-20 max-md:top-[40%] max-md:left-[46%] max-md:w-[14%] max-md:transform-none! md:top-[38%] md:left-[48%] md:w-[6%] xl:w-[7%]" },
  { type: "svg", name: "music-note-3", speed: 0.15, className: "absolute z-20 max-md:top-[43%] max-md:left-[52%] max-md:w-[13.5%] max-md:transform-none! md:top-[42%] md:left-[52%] md:w-[6%] xl:w-[7.3%]" },
  { type: "svg", name: "trumper-shape", className: "absolute z-20 max-md:top-[45%] max-md:right-[10%] max-md:w-[25%] md:top-[42%] md:left-[28%] md:w-[12%]" },

  // 游戏相关
  { type: "svg", name: "gamer-shape", className: "absolute z-20 max-md:top-[57.5%] max-md:left-[-5%] max-md:w-[24%] md:top-[47%] md:left-[4%] md:w-[10%]" },
  { type: "svg", name: "joystick", speed: 0.15, className: "pointer-events-none absolute z-10 max-md:top-[53%] max-md:right-[2%] max-md:w-[18%] max-md:transform-none! md:top-[55.5%] md:left-[40%] md:w-[7%]" },
  { type: "svg", name: "joystick-shape", className: "absolute z-20 max-md:top-[56%] max-md:right-[-2%] max-md:w-[26%] md:top-[55%] md:left-[53%] md:w-[11%]" },

  // 足球相关
  { type: "svg", name: "soccer-circle", speed: 0.15, className: "absolute z-20 max-md:top-[78%] max-md:right-[28%] max-md:w-[9%] max-md:transform-none! md:top-[66%] md:right-[18%] md:w-[3%]" },
  { type: "svg", name: "soccer-circle-2", speed: 0.1, className: "absolute z-20 max-md:top-[84%] max-md:left-[45%] max-md:w-[3%] max-md:transform-none! md:top-[70%] md:left-[19%] md:w-[1%]" },
  { type: "svg", name: "soccer-shape-1", className: "absolute z-20 max-md:top-[68%] max-md:right-[50%] max-md:w-[4%] md:top-[60%] md:right-[33%] md:w-[1.5%]" },
  { type: "svg", name: "soccer-shape-2", speed: 0.07, className: "absolute z-20 max-md:hidden max-md:transform-none! md:top-[64%] md:right-[44%] md:w-[8%]" },
  { type: "svg", name: "soccer-shape-3", className: "absolute z-20 max-md:top-[78.5%] max-md:right-[51%] max-md:w-[16%] md:top-[66.5%] md:right-[41%] md:w-[7%]" },
  { type: "svg", name: "soccer-shape-4", className: "absolute z-20 max-md:top-[87.75%] max-md:right-[18%] max-md:w-[27%] md:top-[76%] md:right-[62%] md:w-[12%]" },
  { type: "svg", name: "soccer-trace", className: "absolute z-20 max-md:top-[83.5%] max-md:right-[-5%] max-md:w-[44%] md:top-[69%] md:right-[49%] md:w-[18%]" },

  // 底部云朵与绿地 (通常位于 Timeline End 区域，属于相对布局，非散落式绝对定位，这里提供参考 className)
  { type: "svg", name: "timeline-end-green-back", speed: -0.15, className: "z-0 max-md:transform-none!" },
  { type: "svg", name: "timeline-end-green-middle", speed: -0.075, className: "z-20 max-md:transform-none!" },
  { type: "svg", name: "timeline-end-green-front", className: "z-30" },
];