// app/market/trade/[id]/page.tsx
"use client";

import { useState, useEffect, useRef, use } from "react";
import { useSession } from "next-auth/react";

interface Message {
    id: string;
    content: string;
    senderId: string;
    sender: { user: { name: string; image: string | null } };
    createdAt: string;
}

export default function SecretChatRoom({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 获取当前登录学生的 Profile ID (需通过 Session 间接获取或在后续比对)
    // 这里我们为了简单比对身份，直接用名字比对（严格来说应该在 API 里把 session user ID 映射好返回）
    const currentUserName = session?.user?.name;

    const fetchMessages = () => {
        fetch(`/api/market/trade/${id}/messages`)
            .then(res => res.json())
            .then(data => setMessages(Array.isArray(data) ? data : []));
    };

    useEffect(() => {
        fetchMessages();
        const timer = setInterval(fetchMessages, 5000); // 每5秒拉取一次最新纸条
        return () => clearInterval(timer);
    }, [id]);

    // 自动滚动到最新消息
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || isSending) return;
        setIsSending(true);

        const res = await fetch(`/api/market/trade/${id}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newMessage })
        });

        if (res.ok) {
            const addedMsg = await res.json();
            setMessages(prev => [...prev, addedMsg]);
            setNewMessage("");
        }
        setIsSending(false);
    };

    return (
        <div className="min-h-screen bg-[#F5F5F3] pt-24 pb-12 font-sans relative overflow-hidden">
            {/* 卡通背景装饰：类似贴纸的元素 */}
            <div className="absolute top-20 left-10 text-6xl opacity-20 rotate-12">🚀</div>
            <div className="absolute bottom-40 right-10 text-7xl opacity-20 -rotate-12">🧸</div>
            <div className="absolute top-40 right-20 text-5xl opacity-20 rotate-45">✨</div>

            <div className="container mx-auto max-w-3xl px-4 relative z-10">

                {/* 秘密基地头部 */}
                <div className="bg-amber-100 border-4 border-amber-900 rounded-[2rem] p-6 mb-6 shadow-[8px_8px_0_rgba(120,53,15,0.2)] flex justify-between items-center transform -rotate-1">
                    <div>
                        <h1 className="text-2xl font-black text-amber-900 tracking-wider">🏕️ 秘密交换基地</h1>
                        <p className="text-amber-800/70 font-bold text-sm mt-1">嘘... 这里只有你们两个人知道</p>
                    </div>
                    <button onClick={() => window.history.back()} className="px-4 py-2 bg-white border-2 border-amber-900 rounded-xl font-bold text-amber-900 hover:bg-amber-50 active:scale-95 transition-transform shadow-[4px_4px_0_rgba(120,53,15,1)]">
                        返回
                    </button>
                </div>

                {/* 聊天记录区：模拟横格作业本 */}
                <div className="bg-[#fefce8] border-4 border-slate-800 rounded-[2.5rem] h-[60vh] flex flex-col shadow-[8px_8px_0_rgba(30,41,59,0.1)] relative overflow-hidden">

                    {/* 横格线背景 CSS 魔法 */}
                    <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(transparent 95%, #cbd5e1 5%)', backgroundSize: '100% 2rem' }}></div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="text-center text-slate-400 mt-20 font-bold bg-white/60 py-4 rounded-3xl w-max mx-auto px-6 backdrop-blur-sm">
                                还没有人丢纸条，快打个招呼吧！📝
                            </div>
                        ) : (
                            messages.map(msg => {
                                const isMe = msg.sender.user.name === currentUserName;

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-3`}>
                                        {!isMe && (
                                            <div className="w-10 h-10 rounded-full bg-rose-200 border-2 border-slate-800 flex items-center justify-center text-xl shadow-[2px_2px_0_rgba(30,41,59,1)] z-10 shrink-0">
                                                {msg.sender.user.name.charAt(0)}
                                            </div>
                                        )}

                                        {/* 便利贴风格的气泡 */}
                                        <div className={`relative max-w-[70%] px-5 py-4 rounded-3xl border-2 border-slate-800 shadow-[4px_4px_0_rgba(30,41,59,1)] text-slate-800 font-medium leading-relaxed
                      ${isMe ? 'bg-morandi-green rounded-br-none' : 'bg-white rounded-bl-none'}
                    `}>
                                            {/* 模拟胶带 */}
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-3 bg-white/50 backdrop-blur-sm border border-slate-200 rotate-2 opacity-80"></div>

                                            {msg.content}
                                            <span className="block text-[10px] text-slate-800/40 mt-2 text-right font-bold">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {isMe && (
                                            <div className="w-10 h-10 rounded-full bg-blue-200 border-2 border-slate-800 flex items-center justify-center text-xl shadow-[2px_2px_0_rgba(30,41,59,1)] z-10 shrink-0">
                                                {msg.sender.user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 底部输入区 */}
                    <div className="p-4 bg-white border-t-4 border-slate-800 flex gap-3 relative z-10">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="写下你想说的话..."
                            className="flex-1 bg-slate-100 border-2 border-slate-300 rounded-2xl px-6 py-4 outline-none focus:border-slate-800 focus:bg-white transition-colors font-medium text-slate-700"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isSending || !newMessage.trim()}
                            className="px-8 py-4 bg-slate-900 border-2 border-slate-800 rounded-2xl text-white font-bold text-lg hover:bg-slate-700 active:scale-95 transition-all shadow-[4px_4px_0_rgba(203,213,225,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                        >
                            <span>{isSending ? "发射中..." : "发射纸条"}</span>
                            <span className="text-xl">🚀</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}