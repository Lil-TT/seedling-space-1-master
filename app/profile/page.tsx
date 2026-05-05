// app/profile/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";
import TeacherDashboard from "./TeacherDashboard";
import TradeInbox from "@/components/market/TradeInbox";
import StudentTaskList from "@/components/activities/StudentTaskList";
import Link from "next/link";
import ParentEmotionChart from "@/components/dashboard/ParentEmotionChart";
import TeacherEmotionRadar from "@/components/dashboard/TeacherEmotionRadar";
import ParentTeacherInbox from "@/components/messages/ParentTeacherInbox";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/api/auth/signin");

    const user = session.user as any;

    let roleDisplayName = "未知角色";
    let primaryStat = { label: "数据加载中", value: "-" };
    let secondaryStat = { label: "数据加载中", value: "-" };
    
    let allStudents: any[] = [];
    let pendingMarketCount = 0;
    let studentData: any = null;
    let allActiveTrades: any[] = [];
    let submittedTasks: any[] = [];
    let parentData: any = null; 
    let myBadges: any[] = [];

    // ==========================================
    // 1. 学生逻辑
    // ==========================================
    if (user.role === "STUDENT") {
        roleDisplayName = "学生";

        myBadges = await prisma.userBadge.findMany({
            where: { userId: user.id },
            include: { badge: true },
            orderBy: { unlockedAt: 'desc' }
        });

        studentData = await prisma.studentProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id, coins: 100 },
            include: {
                initiatedTrades: { include: { item: true, receiver: { include: { user: true } } } },
                receivedTrades: {
                    where: { status: { in: ["ACCEPTED", "COMPLETED"] } }, 
                    include: { item: true, initiator: { include: { user: true } } }
                },
                participations: {
                    where: { status: { in: ["ACCEPTED", "SUBMITTED"] } },
                    include: { activity: true }
                },
                inspirations: { orderBy: { createdAt: 'desc' } } 
            }
        });

        const initiated = studentData.initiatedTrades.map((t: any) => ({ ...t, isInitiator: true, partnerName: t.receiver.user.name }));
        const received = studentData.receivedTrades.map((t: any) => ({ ...t, isInitiator: false, partnerName: t.initiator.user.name }));
        allActiveTrades = [...initiated, ...received].sort((a, b) => b.createdAt - a.createdAt);

        const confessionsCount = await prisma.confession.count({ where: { studentId: studentData.id } });
        primaryStat = { label: "我的情绪币", value: studentData.coins.toString() };
        secondaryStat = { label: "倾诉记录", value: `${confessionsCount} 次` };

    // ==========================================
    // 2. 老师逻辑
    // ==========================================
    } else if (user.role === "TEACHER") {
        roleDisplayName = "教师";
        const teacher = await prisma.teacherProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id },
            include: { classes: { include: { students: { include: { user: true }, orderBy: { troubleCount: 'desc' } } } } }
        });

        allStudents = teacher.classes.flatMap(cls => cls.students.map(s => ({
            id: s.id, name: s.user?.name || "未知", className: cls.name, troubleCount: s.troubleCount, coins: s.coins, leafCount: s.leafCount
        })));

        const studentIds = allStudents.map(s => s.id);
        pendingMarketCount = await prisma.marketItem.count({ where: { ownerId: { in: studentIds }, status: "PENDING" } });
        submittedTasks = await prisma.taskParticipant.findMany({
            where: { status: "SUBMITTED", activity: { initiatorId: user.id } },
            include: { activity: true, student: { include: { user: true } } },
            orderBy: { activityId: 'desc' }
        });

        primaryStat = { label: "关注学生", value: `${allStudents.length} 名` };
        secondaryStat = { label: "待处理预警", value: `${allStudents.filter(s => s.troubleCount >= 3).length} 项` };

    // ==========================================
    // 3. 家长逻辑
    // ==========================================
    } else if (user.role === "PARENT") {
        roleDisplayName = "家长";
        parentData = await prisma.parentProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id },
            include: {
                students: {
                    include: { 
                        user: true,
                        marketItems: { orderBy: { createdAt: 'desc' }, take: 3 }, 
                        participations: { include: { activity: true }, orderBy: { id: 'desc' }, take: 3 },
                        teacherComments: {
                            where: { visibleToParent: true },
                            orderBy: { createdAt: 'desc' },
                            take: 12,
                            include: { teacher: { select: { name: true } } },
                        },
                    }
                }
            }
        });

        if (parentData.students.length > 0) {
            primaryStat = { label: "绑定孩子", value: parentData.students.map((s:any) => s.user.name).join('、') };
        } else {
            primaryStat = { label: "绑定状态", value: "暂未绑定" };
        }
        secondaryStat = { label: "本周情绪", value: "平稳" };
    }

    // ==========================================
    // UI 渲染层
    // ==========================================
    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-5xl relative z-10">

                {/* 1. 头部个人信息名片：增加 z-20 确保在背景墙上层 */}
                <div className="relative z-50 bg-white rounded-[2rem] p-10 shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 border-4 border-slate-900/5 hover:border-slate-900/10 transition-colors">
                    <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-morandi-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-slate-800 text-white flex items-center justify-center text-4xl font-black shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{user.name}</h1>
                            <p className="text-slate-500 mb-3 font-medium">{user.email}</p>
                            <span className="px-4 py-1.5 rounded-xl text-sm font-black tracking-widest uppercase inline-block bg-slate-800 text-white shadow-inner">
                                {roleDisplayName}
                            </span>
                        </div>
                    </div>
                    <div className="relative z-[60] flex flex-row items-center gap-4 mt-4 md:mt-0">
                        {user.role === "STUDENT" && <TradeInbox />}
                        <LogoutButton />
                    </div>
                </div>

                {/* 2. 中间大卡片：增加 z-20 */}
                <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 mb-10">
                    <div className="bg-white rounded-[2rem] p-10 border-4 border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                        <h3 className="text-slate-500 font-bold mb-3 uppercase tracking-widest text-sm">{primaryStat.label}</h3>
                        <p className="text-5xl font-black text-slate-800 tracking-tighter">{primaryStat.value}</p>
                    </div>
                    <div className="bg-white rounded-[2rem] p-10 border-4 border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                        <h3 className="text-slate-500 font-bold mb-3 uppercase tracking-widest text-sm">{secondaryStat.label}</h3>
                        <p className="text-5xl font-black text-slate-800 tracking-tighter">{secondaryStat.value}</p>
                    </div>
                </div>

                {/* ==========================================
                    3. 角色专属面板渲染区
                ========================================== */}
                
                {/* 👉 [老师面板：冷色调 Dashboar] (不受学生背景墙影响) */}
                {user.role === "TEACHER" && (
                    <div className="space-y-10 relative z-10">
                        <TeacherEmotionRadar />
                        <TeacherDashboard students={allStudents} pendingMarketCount={pendingMarketCount} submittedTasks={submittedTasks} />
                        <ParentTeacherInbox role="TEACHER" />
                    </div>
                )}

                {/* 👉 [家长面板：温情看板] (不受学生背景墙影响) */}
                {user.role === "PARENT" && parentData?.students?.length > 0 && (
                    <div className="space-y-8 relative z-10">
                        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 px-2">
                            <span className="text-4xl">📊</span> 孩子情绪与成长大盘
                        </h2>
                        
                        <ParentEmotionChart />

                        <ParentTeacherInbox role="PARENT" />

                        {parentData.students.map((child: any) => (
                            <div key={child.id} className="bg-white rounded-[2rem] p-8 shadow-sm border-4 border-slate-100">
                                {/* ... (家长卡片内部逻辑不变) ... */}
                                <div className="flex items-center justify-between border-b-4 border-slate-50 pb-6 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-200 border-4 border-amber-900 flex items-center justify-center text-2xl font-black text-amber-900 shadow-[2px_2px_0_rgba(120,53,15,1)]">
                                            {child.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{child.user.name}</h3>
                                            <p className="text-sm font-bold text-slate-500 mt-1">金币余额: {child.coins} 🪙 | 成长树叶: {child.leafCount} 🍃</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-amber-50 p-6 rounded-3xl border-4 border-amber-100">
                                        <h4 className="font-black text-amber-900 mb-4 text-base flex items-center gap-2"><span>🎁</span> 最近发布的闲置</h4>
                                        {child.marketItems.length === 0 ? <p className="text-sm text-amber-900/50 font-bold">暂未发布</p> : 
                                            child.marketItems.map((item: any) => (
                                                <p key={item.id} className="text-sm font-bold text-amber-900 bg-white px-4 py-3 rounded-xl mb-3 shadow-sm truncate border-2 border-amber-100">
                                                    《{item.title}》
                                                </p>
                                            ))
                                        }
                                    </div>
                                    <div className="bg-emerald-50 p-6 rounded-3xl border-4 border-emerald-100">
                                        <h4 className="font-black text-emerald-900 mb-4 text-base flex items-center gap-2"><span>⚔️</span> 最近参与的悬赏</h4>
                                        {child.participations.length === 0 ? <p className="text-sm text-emerald-900/50 font-bold">暂未接取任务</p> : 
                                            child.participations.map((p: any) => (
                                                <div key={p.id} className="flex justify-between items-center gap-2 bg-white px-4 py-3 rounded-xl mb-3 shadow-sm border-2 border-emerald-100">
                                                    <p className="text-sm font-bold text-emerald-900 truncate flex-1 min-w-0">《{p.activity.title}》</p>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {p.activity?.kind === "PARENT_CHILD" && (
                                                            <span className="text-[10px] font-black text-rose-700 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-100">亲子</span>
                                                        )}
                                                        <span className="text-[10px] font-black px-2 py-1 bg-emerald-100 rounded-md text-emerald-800 border border-emerald-200">{p.status}</span>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>

                                {child.teacherComments?.length > 0 && (
                                    <div className="mt-6 bg-indigo-50 rounded-3xl border-4 border-indigo-100 p-6">
                                        <h4 className="font-black text-indigo-950 mb-4 flex items-center gap-2">
                                            <span>💌</span> 老师寄语
                                        </h4>
                                        <ul className="space-y-3">
                                            {child.teacherComments.map((c: any) => (
                                                <li key={c.id} className="bg-white rounded-2xl px-4 py-3 border-2 border-indigo-100 shadow-sm">
                                                    <p className="text-slate-800 font-medium leading-relaxed">{c.content}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2 font-bold">
                                                        {(c.teacher?.name || "老师")} · {new Date(c.createdAt).toLocaleString()}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* 👇 👉 [学生端专属内容区]：所有内部模块增加 z-10 确保在背景墙上层渲染 */}
                {/* 🌟 游戏化引擎：成就徽章墙 */}
                {user.role === "STUDENT" && (
                    <div className="relative z-10 mt-10 bg-[#f8fafc] rounded-[3rem] p-8 md:p-12 border-4 border-slate-900 shadow-[8px_8px_0_rgba(15,23,42,1)]">
                        <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <span className="text-4xl drop-shadow-md">🏅</span> 我的成就徽章
                        </h2>
                        
                        {myBadges.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 border-4 border-dashed border-slate-300 rounded-3xl bg-white">
                                <span className="text-5xl grayscale opacity-50 mb-4">🏆</span>
                                <p className="text-slate-500 font-bold">还没有解锁徽章哦，快去完成交易或记录灵感吧！</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-6">
                                {myBadges.map((ub) => (
                                    <div key={ub.id} className="group relative flex flex-col items-center justify-center w-32 h-36 bg-amber-100 rounded-[2rem] border-4 border-slate-900 shadow-[4px_4px_0_rgba(15,23,42,1)] hover:-translate-y-2 hover:shadow-[8px_8px_0_rgba(15,23,42,1)] hover:bg-amber-200 transition-all cursor-pointer">
                                        
                                        {/* 闪光特效 */}
                                        <div className="absolute -top-2 -right-2 text-xl opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity">✨</div>
                                        
                                        {/* 徽章图标 (可以是 emoji 也可以是图片路径) */}
                                        <div className="w-16 h-16 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center text-3xl shadow-inner mb-2 group-hover:scale-110 transition-transform">
                                            {ub.badge.iconUrl.includes('/') ? (
                                                <img src={ub.badge.iconUrl} alt="badge" className="w-10 h-10 object-contain" />
                                            ) : (
                                                <span>{ub.badge.iconUrl}</span>
                                            )}
                                        </div>
                                        
                                        <p className="font-black text-slate-900 text-xs text-center px-1 leading-tight">
                                            {ub.badge.name}
                                        </p>
                                        
                                        {/* 悬浮显示的描述气泡 */}
                                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-max max-w-[200px] bg-slate-900 text-white text-[10px] font-bold px-3 py-2 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                                            {ub.badge.description}
                                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* 學生面板 1：正在进行的交换 */}
                {user.role === "STUDENT" && allActiveTrades.length > 0 && (
                    <div className="relative z-10 mt-10 bg-white rounded-[3rem] p-8 md:p-12 border-4 border-slate-900/5 shadow-sm hover:shadow-[12px_12px_0_rgba(15,23,42,0.05)] transition-all">
                        <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <span className="text-4xl drop-shadow-md">🎢</span> 流转中心记录
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {allActiveTrades.map((trade: any) => (
                                <div key={trade.id} className="relative p-6 rounded-3xl bg-white border-4 border-slate-200 flex flex-col justify-between group hover:border-slate-800 hover:-translate-y-1 transition-all shadow-sm hover:shadow-[6px_6px_0_rgba(15,23,42,1)]">
                                    {/* ... (内部逻辑不变) ... */}
                                    {trade.status === 'COMPLETED' && (
                                        <div className="absolute -top-4 -left-4 bg-emerald-400 text-emerald-950 text-sm font-black px-4 py-2 rounded-xl shadow-md transform -rotate-6 border-4 border-emerald-900 z-20">
                                            🎉 交易已完成
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-black uppercase px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg border-2 border-slate-200">
                                                {trade.status === 'PENDING' ? '等待回复...' : trade.status === 'COMPLETED' ? '已收货' : '正在商量中'}
                                            </span>
                                            <span className="text-xs text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-md">#{trade.id.slice(-4)}</span>
                                        </div>
                                        <p className="font-bold text-slate-500 text-sm mt-2 flex items-center gap-2">
                                            {trade.isInitiator ? "你想换 " : "TA想换你的 "}
                                            <span className="px-2 py-1 bg-amber-100 text-amber-900 rounded-md border border-amber-200">@{trade.partnerName}</span>
                                            {trade.isInitiator ? " 的：" : "："}
                                        </p>
                                        <h4 className="text-2xl font-black text-slate-900 mt-3 tracking-tight">《{trade.item.title}》</h4>
                                    </div>
                                    
                                    <Link href={`/market/trade/${trade.id}`} className="mt-8 py-4 bg-white border-4 border-slate-800 rounded-2xl text-center text-base font-black text-slate-900 shadow-[0_4px_0_rgba(15,23,42,1)] active:shadow-[0_0px_0_rgba(15,23,42,1)] active:translate-y-1 transition-all">
                                        {trade.status === 'COMPLETED' ? "查看历史纸条 📝" : "去秘密基地商量 🚀"}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 学生面板 2：灵感闪念墙 (视觉超级放大版) */}
                {user.role === "STUDENT" && studentData?.inspirations?.length > 0 && (
                    <div className="relative z-10 mt-12 bg-rose-50/70 backdrop-blur-sm rounded-[3rem] p-8 md:p-12 border-4 border-rose-900/20 shadow-sm hover:shadow-[12px_12px_0_rgba(159,18,57,0.05)] transition-all overflow-hidden">
                        {/* ... (内部逻辑不变) ... */}
                        <div className="absolute -top-10 -right-10 text-9xl opacity-10 pointer-events-none transform rotate-12">💡</div>
                        <h2 className="text-3xl font-black text-rose-900 mb-10 flex items-center gap-3 relative z-10">
                            <span className="text-4xl drop-shadow-md">💡</span> 我的灵感闪念墙
                        </h2>
                        
                        <div className="columns-1 md:columns-2 gap-6 space-y-6">
                            {studentData.inspirations.map((ins: any, index: number) => {
                                // 随机倾斜角度，制造真实手账贴纸感
                                const rotation = index % 2 === 0 ? 'hover:-rotate-2' : 'hover:rotate-2';
                                
                                return (
                                <div key={ins.id} className={`break-inside-avoid p-8 bg-[#fffdf0] border-4 border-rose-900 rounded-[2rem] shadow-[6px_6px_0_rgba(159,18,57,1)] hover:shadow-[10px_10px_0_rgba(159,18,57,1)] hover:-translate-y-2 transition-all transform ${rotation}`}>
                                    {/* 模拟粗大的纸胶带 */}
                                    <div className="w-16 h-5 bg-rose-300/80 mx-auto -mt-6 mb-6 rounded-sm rotate-3 shadow-sm border border-rose-900/20 backdrop-blur-sm"></div> 
                                    
                                    {/* 核心文本放大 */}
                                    <p className="text-2xl md:text-3xl font-black text-slate-800 leading-snug tracking-tight">
                                        "{ins.content}"
                                   </p>
                                   
                                   <div className="mt-6 flex items-end justify-between border-t-4 border-rose-900/10 pt-4">
                                       <div className="flex gap-2">
                                           {ins.emotionTags?.map((tag: string, i: number) => (
                                               <span key={i} className="text-xs font-black px-3 py-1 bg-rose-100 text-rose-800 rounded-lg border-2 border-rose-900/20">
                                                   #{tag}
                                               </span>
                                           ))}
                                       </div>
                                       <p className="text-sm font-black text-slate-400 bg-white px-3 py-1 rounded-lg border-2 border-slate-100">
                                           {new Date(ins.createdAt).toLocaleDateString()}
                                       </p>
                                   </div>
                               </div>
                           )})}
                       </div>
                   </div>
               )}

                {/* 学生面板 3：接取的任务组件 */}
                {user.role === "STUDENT" && studentData?.participations?.length > 0 && (
                    <div className="relative z-10">
                        <StudentTaskList participations={studentData.participations} />
                    </div>
                )}

            </div>
        </div>
    );
}