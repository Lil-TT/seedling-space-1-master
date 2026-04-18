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

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/api/auth/signin");

    const user = session.user as any;

    let roleDisplayName = "未知角色";
    let primaryStat = { label: "数据加载中", value: "-" };
    let secondaryStat = { label: "数据加载中", value: "-" };
    
    // 数据容器声明
    let allStudents: any[] = [];
    let pendingMarketCount = 0;
    let studentData: any = null;
    let allActiveTrades: any[] = [];
    let submittedTasks: any[] = [];
    let parentData: any = null; // 👈 新增：家长的专属数据容器

    // ==========================================
    // 1. 学生逻辑：查金币、交易、灵感、任务
    // ==========================================
    if (user.role === "STUDENT") {
        roleDisplayName = "学生";
        studentData = await prisma.studentProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id, coins: 100 },
            include: {
                initiatedTrades: { include: { item: true, receiver: { include: { user: true } } } },
                receivedTrades: {
                    where: { status: { in: ["ACCEPTED", "COMPLETED"] } }, // 把已完成的也查出来
                    include: { item: true, initiator: { include: { user: true } } }
                },
                participations: {
                    where: { status: { in: ["ACCEPTED", "SUBMITTED"] } },
                    include: { activity: true }
                },
                inspirations: { orderBy: { createdAt: 'desc' } } // 👈 查出灵感闪念
            }
        });

        // 交易数据合并装配
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
    // 3. 家长逻辑：深度查询孩子动态
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
                        marketItems: { orderBy: { createdAt: 'desc' }, take: 3 }, // 查出孩子最近发布的3个物品
                        participations: { include: { activity: true }, orderBy: { id: 'desc' }, take: 3 } // 最近参与的3个任务
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
        <div className="min-h-screen bg-[#F5F5F3] pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-5xl">

                {/* 1. 头部个人信息名片 */}
                <div className="bg-white rounded-[2rem] p-10 shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative">
                    <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-morandi-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-slate-800 text-white flex items-center justify-center text-3xl font-bold shadow-md">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{user.name}</h1>
                            <p className="text-slate-500 mb-3">{user.email}</p>
                            <span className="px-4 py-1.5 rounded-full text-sm font-semibold inline-block bg-slate-800 text-white">
                                {roleDisplayName}身份
                            </span>
                        </div>
                    </div>
                    <div className="relative z-[60] flex flex-row items-center gap-4 mt-4 md:mt-0">
                        {user.role === "STUDENT" && <TradeInbox />}
                        <LogoutButton />
                    </div>
                </div>

                {/* 2. 中间大卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="bg-white rounded-[2rem] p-10 shadow-sm flex flex-col items-center justify-center text-center">
                        <h3 className="text-slate-500 font-medium mb-3">{primaryStat.label}</h3>
                        <p className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">{primaryStat.value}</p>
                    </div>
                    <div className="bg-white rounded-[2rem] p-10 shadow-sm flex flex-col items-center justify-center text-center">
                        <h3 className="text-slate-500 font-medium mb-3">{secondaryStat.label}</h3>
                        <p className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">{secondaryStat.value}</p>
                    </div>
                </div>

                {/* ==========================================
                    3. 角色专属面板渲染区
                ========================================== */}
                
                {/* 👉 [老师面板] */}
                {user.role === "TEACHER" && (
                    <TeacherDashboard students={allStudents} pendingMarketCount={pendingMarketCount} submittedTasks={submittedTasks} />
                )}

                {/* 👉 [家长面板：孩子动态看板] */}
                {user.role === "PARENT" && parentData?.students?.length > 0 && (
                    <div className="mt-10 space-y-6 relative z-10">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 px-2">
                            <span>👨‍👩‍👧</span> 孩子们的成长足迹
                        </h2>
                        {parentData.students.map((child: any) => (
                            <div key={child.id} className="bg-white rounded-[2rem] p-8 shadow-sm border-4 border-slate-800/10">
                                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-6 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-200 border-2 border-amber-900 flex items-center justify-center text-xl font-bold">
                                            {child.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800">{child.user.name}</h3>
                                            <p className="text-sm font-bold text-slate-500">金币余额: {child.coins} 🪙 | 成长树叶: {child.leafCount} 🍃</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* 孩子发布的闲置 */}
                                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                                        <h4 className="font-bold text-amber-900 mb-4 text-sm flex items-center gap-1"><span>🎁</span> 最近发布的闲置</h4>
                                        {child.marketItems.length === 0 ? <p className="text-xs text-amber-900/50">暂未发布</p> : 
                                            child.marketItems.map((item: any) => (
                                                <p key={item.id} className="text-sm font-bold text-amber-900 bg-white px-3 py-2 rounded-lg mb-2 shadow-sm truncate">
                                                    《{item.title}》
                                                </p>
                                            ))
                                        }
                                    </div>
                                    {/* 孩子接取的悬赏 */}
                                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                                        <h4 className="font-bold text-emerald-900 mb-4 text-sm flex items-center gap-1"><span>⚔️</span> 最近参与的悬赏</h4>
                                        {child.participations.length === 0 ? <p className="text-xs text-emerald-900/50">暂未接取任务</p> : 
                                            child.participations.map((p: any) => (
                                                <div key={p.id} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg mb-2 shadow-sm">
                                                    <p className="text-sm font-bold text-emerald-900 truncate">《{p.activity.title}》</p>
                                                    <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded text-slate-500">{p.status}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 👉 [学生面板 1：正在进行的交换 (增加角标)] */}
                {user.role === "STUDENT" && allActiveTrades.length > 0 && (
                    <div className="mt-10 bg-white rounded-[2.5rem] p-8 shadow-sm border-4 border-slate-800 relative z-10">
                        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2"><span>🎢</span> 流转中心记录</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allActiveTrades.map((trade: any) => (
                                <div key={trade.id} className="relative p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 flex flex-col justify-between group hover:border-slate-800 transition-all">
                                    
                                    {/* 🎯 新增：“已完成”角标 */}
                                    {trade.status === 'COMPLETED' && (
                                        <div className="absolute -top-3 -left-3 bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md transform -rotate-6 border-2 border-emerald-900 z-20">
                                            🎉 交易已完成
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-200 rounded-md">
                                                {trade.status === 'PENDING' ? '等待回复' : trade.status === 'COMPLETED' ? '已收货' : '正在商量'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">ID: {trade.id.slice(-4)}</span>
                                        </div>
                                        <p className="font-bold text-slate-700 text-sm mt-2">
                                            {trade.isInitiator ? "你想换 " : "TA想换你的 "}<span className="text-slate-900">@{trade.partnerName}</span>{trade.isInitiator ? " 的：" : "："}
                                        </p>
                                        <h4 className="text-lg font-black text-slate-900 mt-1">《{trade.item.title}》</h4>
                                    </div>
                                    
                                    <Link href={`/market/trade/${trade.id}`} className="mt-6 py-3 bg-white border-2 border-slate-800 rounded-2xl text-center text-sm font-black text-slate-900 shadow-[4px_4px_0_rgba(0,0,0,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
                                        {trade.status === 'COMPLETED' ? "查看历史纸条 📝" : "去秘密基地商量 🚀"}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 👉 [学生面板 2：灵感闪念墙 (新增)] */}
                {user.role === "STUDENT" && studentData?.inspirations?.length > 0 && (
                    <div className="mt-8 bg-rose-50 rounded-[2.5rem] p-8 border-4 border-rose-900 shadow-[8px_8px_0_rgba(159,18,57,0.1)] relative z-10">
                        <h2 className="text-2xl font-black text-rose-900 mb-6 flex items-center gap-2">
                            <span>💡</span> 我的灵感闪念墙
                        </h2>
                        <div className="columns-1 md:columns-2 gap-4 space-y-4">
                            {studentData.inspirations.map((ins: any) => (
                                <div key={ins.id} className="break-inside-avoid p-5 bg-white border-2 border-rose-200 rounded-2xl shadow-sm hover:border-rose-400 transition-colors">
                                    <div className="w-8 h-3 bg-rose-200/50 mx-auto -mt-2 mb-3 rounded-full rotate-2"></div> {/* 模拟胶带 */}
                                    <p className="text-slate-700 font-medium leading-relaxed">{ins.content}</p>
                                    <p className="text-[10px] text-slate-400 mt-4 font-bold text-right border-t border-slate-100 pt-2">
                                        {new Date(ins.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 👉 [学生面板 3：接取的任务] */}
                {user.role === "STUDENT" && studentData?.participations?.length > 0 && (
                    <StudentTaskList participations={studentData.participations} />
                )}

            </div>
        </div>
    );
}