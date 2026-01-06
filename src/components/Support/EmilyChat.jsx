import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, User, MinusSquare } from 'lucide-react';
import { SupportAgent } from '../../services/SupportAgent';
import clsx from 'clsx';
import useStore from '../../store/useStore';

/**
 * EmilyChat - AI Support Component
 */
function EmilyChat({ forcedOpen = false, onClose }) {
    const [isOpen, setIsOpen] = useState(forcedOpen);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi! I'm Emily, your Secretary support assistant. How can I help you be more productive today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const user = useStore(state => state.user);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        const aiResponse = await SupportAgent.chat(userMsg, messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }]
        })));

        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 md:w-96 h-[500px] mb-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-skin-accent p-6 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">Emily</h3>
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-70">AI Support Agent</p>
                            </div>
                        </div>
                        <button onClick={() => {
                            if (onClose) onClose();
                            setIsOpen(false);
                        }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    {/* ... (no changes to messages section) */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                        {messages.map((m, i) => (
                            <div key={i} className={clsx("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
                                <div className={clsx("w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center", m.role === 'assistant' ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-600")}>
                                    {m.role === 'assistant' ? <Sparkles size={14} /> : <User size={14} />}
                                </div>
                                <div className={clsx(
                                    "p-3 rounded-2xl text-sm max-w-[80%] whitespace-pre-wrap leading-relaxed shadow-sm",
                                    m.role === 'assistant'
                                        ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                                        : "bg-skin-accent text-white rounded-tr-none"
                                )}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-3 animate-pulse">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                                    <Sparkles size={14} />
                                </div>
                                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 text-xs italic rounded-tl-none border border-slate-100 dark:border-white/5">
                                    Emily is typing...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Input */}
                    <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 shrink-0">
                        <div className="relative flex items-center">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask Emily anything..."
                                className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-skin-accent outline-none transition-all dark:text-white"
                            />
                            <button className="absolute right-2 p-2 bg-skin-accent text-white rounded-xl shadow-lg shadow-skin-accent/30 hover:opacity-90 active:scale-95 transition-all">
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            {!forcedOpen && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={clsx(
                        "p-4 rounded-full shadow-2xl shadow-skin-accent/40 flex items-center gap-3 transition-all duration-300 active:scale-90",
                        isOpen ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white" : "bg-skin-accent text-white scale-110"
                    )}
                >
                    {isOpen ? <MinusSquare size={24} /> : <MessageCircle size={28} />}
                    {!isOpen && <span className="font-bold text-sm pr-2">Chat with Emily</span>}
                </button>
            )}
        </div>
    );
}

export default EmilyChat;
