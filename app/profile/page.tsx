// app/profile/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import TeacherDashboard from "./TeacherDashboard";
import TradeInbox from "@/components/market/TradeInbox";
import StudentTaskList from "@/components/activities/StudentTaskList";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const user = session.user as any;

    let roleDisplayName = "未知角色";
    let primaryStat = { label: "数据加载中", value: "-" };
    let secondaryStat = { label: "数据加载中", value: "-" };
    let allStudents: any[] = [];
    let pendingMarketCount = 0; // 新增声明
    let studentData: any = null;
    let allActiveTrades: any[] = [];
    let submittedTasks: any[] = [];

    // 1. 学生逻辑 (动态查情绪币和倾诉次数)
    if (user.role === "STUDENT") {
        roleDisplayName = "学生";
        studentData = await prisma.studentProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id, coins: 100 },
            include: {
                // 1. 查出我发起的交易
                initiatedTrades: {
                    include: { item: true, receiver: { include: { user: true } } }
                },
                // 2. 查出我收到的交易 (只查那些已经 ACCEPTED 正在商量的，因为 PENDING 的在右上角信封里处理)
                receivedTrades: {
                    where: { status: "ACCEPTED" },
                    include: { item: true, initiator: { include: { user: true } } }
                },
                participations: {
                    where: { status: { in: ["ACCEPTED", "SUBMITTED"] } },
                    include: { activity: true }
                }
            }
        });

        // 👉 将两类交易合并，并打上身份标签，方便前端渲染不同文案
        const initiated = studentData.initiatedTrades.map((t: any) => ({
            ...t,
            isInitiator: true,
            partnerName: t.receiver.user.name
        }));

        const received = studentData.receivedTrades.map((t: any) => ({
            ...t,
            isInitiator: false,
            partnerName: t.initiator.user.name
        }));

        allActiveTrades = [...initiated, ...received].sort((a, b) => b.createdAt - a.createdAt);

        const confessionsCount = await prisma.confession.count({
            where: { studentId: studentData.id }
        });

        primaryStat = { label: "我的情绪币", value: studentData.coins.toString() };
        secondaryStat = { label: "倾诉记录", value: `${confessionsCount} 次` };

        // 2. 老师逻辑 (动态查关联班级下的学生，并排序)
    } else if (user.role === "TEACHER") {
        roleDisplayName = "教师";
        const teacher = await prisma.teacherProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id },
            include: {
                classes: {
                    include: {
                        students: {
                            include: { user: true },
                            orderBy: { troubleCount: 'desc' } // 烦恼次数最多的排在最前面
                        }
                    }
                }
            }
        });

        // 扁平化处理：把所有班级的学生汇总到一个数组，并打上斑级标签
        allStudents = teacher.classes.flatMap(cls =>
            cls.students.map(s => ({
                id: s.id,
                name: s.user?.name || "未知学生",
                className: cls.name,
                troubleCount: s.troubleCount,
                coins: s.coins,
                leafCount: s.leafCount
            }))
        );

        const crisisCount = allStudents.filter(s => s.troubleCount >= 3).length;

        // 👉 1. 提取老师名下所有学生的 ID 数组
        const studentIds = allStudents.map(s => s.id);

        // 👉 2. 核心查询：去市场表里寻找这些学生提交的，且状态为 PENDING 的物品数量
        pendingMarketCount = await prisma.marketItem.count({
            where: {
                ownerId: { in: studentIds },
                status: "PENDING"
            }
        });

        primaryStat = { label: "关注学生", value: `${allStudents.length} 名` };
        secondaryStat = { label: "待处理预警", value: `${crisisCount} 项` };

        submittedTasks = await prisma.taskParticipant.findMany({
            where: {
                status: "SUBMITTED",
                activity: { initiatorId: user.id } // 限定是这个老师发布的任务
            },
            include: {
                activity: true,
                student: { include: { user: true } }
            },
            orderBy: { activityId: 'desc' }
        });

        // 👉 3. 把 pendingMarketCount 传给外层的某个变量，方便下面传给组件
        // (我们需要在页面最上方 let pendingMarketCount = 0; 提前声明一下)
        // let teacherPendingMarketCount = 0;
        // teacherPendingMarketCount = pendingMarketCount;

        // 3. 家长逻辑 (动态查绑定的孩子姓名)
    } else if (user.role === "PARENT") {
        roleDisplayName = "家长";
        const parent = await prisma.parentProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id },
            include: {
                students: {
                    include: { user: true } // 把孩子的 User 表里的名字也一并查出来
                }
            }
        });

        // 如果绑定了孩子，就把孩子的名字拼出来显示；如果没有，才显示暂未绑定
        if (parent.students.length > 0) {
            const studentNames = parent.students.map(s => s.user.name).join('、');
            primaryStat = { label: "绑定孩子", value: studentNames };
        } else {
            primaryStat = { label: "绑定状态", value: "暂未绑定" };
        }

        secondaryStat = { label: "本周情绪", value: "平稳" };

        // 4. 超管逻辑
    } else if (user.role === "SUPER_ADMIN") {
        roleDisplayName = "超级管理员";
        const totalUsers = await prisma.user.count();
        primaryStat = { label: "全站用户数", value: `${totalUsers} 人` };
        secondaryStat = { label: "系统状态", value: "健康" };
    }

    return (
        <div className="min-h-screen bg-[#F5F5F3] pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-4xl">

                {/* ==========================================
                    第一部分：头部个人信息名片
                ========================================== */}
                <div className="bg-white rounded-[2rem] p-10 shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative">

                    {/* 背景光晕隔离层 */}
                    <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-morandi-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    </div>

                    {/* 左侧：头像与文字 */}
                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-slate-800 text-white flex items-center justify-center text-3xl font-bold shadow-md">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{user.name}</h1>
                            <p className="text-slate-500 mb-3">{user.email}</p>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold inline-block ${user.role === 'STUDENT' ? 'bg-morandi-blue/20 text-blue-700' :
                                user.role === 'TEACHER' ? 'bg-morandi-green/20 text-emerald-700' :
                                    user.role === 'PARENT' ? 'bg-morandi-yellow/30 text-amber-700' :
                                        'bg-slate-800 text-white'
                                }`}>
                                {roleDisplayName}身份
                            </span>
                        </div>
                    </div>

                    {/* 右侧：这就是你刚刚替换的那段按钮代码（收件箱 + 退出） */}
                    <div className="relative z-[60] flex flex-row items-center gap-4 mt-4 md:mt-0">
                        {user.role === "STUDENT" && <TradeInbox />}
                        <LogoutButton />
                    </div>
                </div>

                {/* ==========================================
                    第二部分：中间的两个数据大卡片
                ========================================== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="bg-white rounded-[2rem] p-10 shadow-sm flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
                        <h3 className="text-slate-500 font-medium mb-3">{primaryStat.label}</h3>
                        <p className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">{primaryStat.value}</p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-10 shadow-sm flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
                        <h3 className="text-slate-500 font-medium mb-3">{secondaryStat.label}</h3>
                        <p className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">{secondaryStat.value}</p>
                    </div>
                </div>

                {/* ==========================================
                    第三部分：底部的角色专属工作台
                ========================================== */}

                {/* 老师的专属面板 */}
                {user.role === "TEACHER" && (
                    <TeacherDashboard students={allStudents} pendingMarketCount={pendingMarketCount} submittedTasks={submittedTasks} />
                )}

                {/* 学生的专属面板：正在进行的交换 (合并了收发两端) */}
                {user.role === "STUDENT" && allActiveTrades.length > 0 && (
                    <div className="mt-10 bg-white rounded-[2.5rem] p-8 shadow-sm border-4 border-slate-800 shadow-[8px_8px_0_rgba(0,0,0,0.05)] relative z-10">
                        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <span>🎢</span> 正在进行的交换
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allActiveTrades.map((trade: any) => (
                                <div key={trade.id} className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 flex flex-col justify-between group hover:border-slate-800 transition-all">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-200 rounded-md">
                                                {trade.status === 'PENDING' ? '等待回复' : '正在商量'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">ID: {trade.id.slice(-4)}</span>
                                        </div>
                                        <p className="font-bold text-slate-700 text-sm">
                                            {/* 👉 根据身份动态显示文案 */}
                                            {trade.isInitiator ? "你想换 " : "TA想换你的 "}
                                            <span className="text-slate-900">@{trade.partnerName}</span>
                                            {trade.isInitiator ? " 的：" : "："}
                                        </p>
                                        <h4 className="text-lg font-black text-slate-900 mt-1">《{trade.item.title}》</h4>
                                    </div>

                                    {/* 跳转私聊的链接 */}
                                    <Link
                                        href={`/market/trade/${trade.id}`}
                                        className="mt-6 py-3 bg-white border-2 border-slate-800 rounded-2xl text-center text-sm font-black text-slate-900 shadow-[4px_4px_0_rgba(0,0,0,1)] group-hover:bg-morandi-green group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all"
                                    >
                                        去秘密基地商量 🚀
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 学生的任务 */}
                {user.role === "STUDENT" && studentData?.participations?.length > 0 && (
                    <StudentTaskList participations={studentData.participations} />
                )}

            </div>
        </div>
    );
}