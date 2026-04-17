// lib/dashboard-data.ts

// 四大（六大）核心卡片数据
export const coreCardsData = [
    {
        title: "委托活动大厅",
        description: "参与老师与家长发布的共创委托，揭榜接取任务赚取情绪币。",
        bgColor: "rose-100", // 浪漫的淡玫瑰色
        textColor: "rose-900",
        href: "/activities", // 注意：这里使用了 href，确保与组件中的 <Link href={card.href}> 匹配
        linkText: "探索活动 →"
    },
    {
        title: "童心流转市场",
        description: "发布你的闲置物品与心愿，用铅笔、书本或情绪币交换惊喜。",
        bgColor: "morandi-yellow",
        textColor: "slate-800",
        href: "/market",
        linkText: "去逛逛 →"
    },
    {
        title: "3D 树洞与成长",
        description: "倾诉你的小烦恼，用每一次的情绪波动培育千人千面的专属成长树。",
        bgColor: "amber-100", // 温馨的淡琥珀色
        textColor: "amber-900",
        href: "/growth",
        linkText: "查看成长树 →"
    },
    {
        title: "个人数字工作台",
        description: "查看你的资产余额、待处理的交易请求与老师发布的预警状态。",
        bgColor: "morandi-yellow",
        textColor: "slate-800",
        href: "/profile",
        linkText: "进入主页 →"
    },
    {
        title: "秘密通讯基地",
        description: "在由便利贴和作业本组成的专属私密空间，与小伙伴偷偷传纸条。",
        bgColor: "amber-100", // 温馨的淡琥珀色
        textColor: "amber-900",
        href: "/profile", // 从主页的消息盒子进入具体私聊
        linkText: "查收纸条 →"
    },
    {
        title: "灵感闪念捕手",
        description: "随时记录转瞬即逝的奇思妙想，让每一个灵感都化作情绪币的养分。",
        bgColor: "rose-100", // 浪漫的淡玫瑰色
        textColor: "rose-900",
        href: "/growth",
        linkText: "记录灵感 →"
    },
    {
        title: "暂未开发的神秘空间",
        description: "敬请期待更多惊喜功能上线，继续用童心探索未知的数字世界！",
        bgColor: "rose-100", // 浪漫的淡玫瑰色
        textColor: "rose-900",
        href: "/growth",
        linkText: "敬请期待 →"
    }
];

// Callout 区域成果描述数据 (深度本地化翻译)
export const achievementsData = [
    "敏锐、充满温度的童心数据洞察", // 对应 "Fast, high-quality insights"
    "无缝衔接的师生家校互动闭环",   // 对应 "One seamless project lead"
    "专为多元化情绪生态构建的架构"  // 对应 "Built for multi-market studies"
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
  { type: "riv", name: "basketball_player", className: "absolute z-10 aspect-[1608/1608] max-md:bottom-[4%] max-md:left-[-15%] max-md:w-[58%] md:bottom-[4%] md:left-[-5%] md:w-[44%]" },

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

// 2. 数据里程碑 (Numbers Stack)
export const numbersData = [
    {
        num: "10,000+",
        desc: "颗情绪币在孩子们手中流转，不仅是奖励，更是友善与互助的证明。",
        color: "morandi-yellow",
        // 心形/钱币的融合图标路径
        icon: "M33 60C33 60 12 43.125 12 26.25C12 17.2664 19.2664 10 28.25 10C33.3934 10 38.0772 12.4042 41 16.1458C43.9228 12.4042 48.6066 10 53.75 10C62.7336 10 70 17.2664 70 26.25C70 43.125 49 60 49 60L41 66L33 60Z"
    },
    {
        num: "5,000+",
        desc: "棵专属 3D 成长树在这里生根发芽，记录下每一次微小的喜怒哀乐。",
        color: "morandi-green",
        // 树苗/叶子图标路径
        icon: "M41 10C41 10 20 22 20 42C20 54 30 62 41 66C52 62 62 54 62 42C62 22 41 10 41 10ZM41 54C34 46 30 36 30 28C30 24 32 20 35 18C38 24 41 30 41 30C41 30 44 24 47 18C50 20 52 24 52 28C52 36 48 46 41 54Z"
    },
    {
        num: "2,000+",
        desc: "次心愿与闲置物品的成功交换，连接起跨越班级与年级的纯真友谊。",
        color: "morandi-blue",
        // 握手/交换的环形图标路径
        icon: "M41 16C27.1929 16 16 27.1929 16 41C16 54.8071 27.1929 66 41 66C54.8071 66 66 54.8071 66 41C66 27.1929 54.8071 16 41 16ZM41 56C32.7157 56 26 49.2843 26 41C26 32.7157 32.7157 26 41 26C49.2843 26 56 32.7157 56 41C56 49.2843 49.2843 56 41 56ZM46 36L41 31L36 36H40V46H42V36H46Z"
    }
];

// 3. 精选文章与动态 (Featured Articles)
export const articlesData = [
    {
        title: "如何将孩子的日常小烦恼，转化为成长的宝贵养分？",
        tags: ["家长必读", "情绪引导"],
        img: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=800&auto=format&fit=crop"
    },
    {
        title: "童心市场交易指南：教孩子认识第一堂『财商与分享课』",
        tags: ["系统指南", "财商启蒙"],
        img: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=800&auto=format&fit=crop"
    },
    {
        title: "高年级视角的成长悬赏：校园里的责任感是如何练成的",
        tags: ["校园共创", "责任感"],
        img: "https://picsum.photos/seed/school/800/500"
    },
    {
        title: "3D 情绪树背后的技术与逻辑：让每一次点击都有温度",
        tags: ["开发日志", "Web3D"],
        img: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop"
    }
];

// 4. 共创伙伴/标签墙 (Brands Marquee) 
// 这里使用高质感的教育/创意类文字 Logo 或图标 (你可以后续替换本地 SVG)
export const brandsRow1 = [
    { name: "CreativeKids", src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "EduSpace", src: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
    { name: "GrowthMind", src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    { name: "FutureStar", src: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" }
];

export const brandsRow2 = [
    { name: "MindMarket", src: "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg" },
    { name: "HeartSync", src: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
    { name: "PlayLearn", src: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png" },
    { name: "KidsPro", src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" }
];