// app/profile/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";
import TeacherDashboard from "./TeacherDashboard";

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

    // 1. 学生逻辑 (动态查情绪币和倾诉次数)
    if (user.role === "STUDENT") {
        roleDisplayName = "学生";
        const student = await prisma.studentProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id, coins: 100 },
        });
        const confessionsCount = await prisma.confession.count({
            where: { studentId: student.id }
        });

        primaryStat = { label: "我的情绪币", value: student.coins.toString() };
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

        primaryStat = { label: "关注学生", value: `${allStudents.length} 名` };
        secondaryStat = { label: "待处理预警", value: `${crisisCount} 项` };

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

                {/* 头部：信息名片 */}
                <div className="bg-white rounded-[2rem] p-10 shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-morandi-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

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

                    <div className="relative z-10 mt-4 md:mt-0">
                        <LogoutButton />
                    </div>
                </div>

                {/* 身体：动态数据看板 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[2rem] p-10 shadow-sm flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
                        <h3 className="text-slate-500 font-medium mb-3">{primaryStat.label}</h3>
                        <p className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">{primaryStat.value}</p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-10 shadow-sm flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
                        <h3 className="text-slate-500 font-medium mb-3">{secondaryStat.label}</h3>
                        <p className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">{secondaryStat.value}</p>
                    </div>
                </div>

                {/* 在动态数据看板下方，增加特定角色的专属工作台 */}
                {user.role === "TEACHER" && (
                    <TeacherDashboard students={allStudents} />
                )}
            </div>
        </div>
    );
}