"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Layers,
  StopCircle,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  actionTaken?: string;
}

export function AdminAIChat({ onTaskTriggered }: { onTaskTriggered?: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "السلام عليكم ورحمة الله وبركاته يا مشرفنا الفاضل. أنا مساعد الذكاء الاصطناعي لمداد، جاهز لتنفيذ أوامرك فوراً. يمكنك أن تأمرني مثلاً: «استورد أحاديث صحيح مسلم كاملاً»، «نزل صحيح البخاري»، «كم عدد الأحاديث المحفوظة الآن؟»، أو «أوقف الاستيراد».",
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", prompt: query }),
      });

      const data = await res.json();
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.reply || "تم استلام طلبك وتنفيذه.",
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        actionTaken: data.executedAction,
      };

      setMessages((prev) => [...prev, aiReply]);
      if (data.executedAction && onTaskTriggered) {
        onTaskTriggered();
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "تعذر الاتصال بخدمة الذكاء الاصطناعي، يرجى المحاولة مرة أخرى.",
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    { label: "📥 استيراد أحاديث صحيح مسلم كاملة", prompt: "استورد أحاديث صحيح مسلم كاملة" },
    { label: "📖 استيراد صحيح البخاري", prompt: "استورد صحيح البخاري كاملاً" },
    { label: "📊 إحصائيات المستودع والذاكرة", prompt: "ما هي إحصائيات الأحاديث المحفوظة؟" },
    { label: "⏹️ إيقاف الاستيراد الجاري", prompt: "أوقف الاستيراد الحالي" },
  ];

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 border border-emerald-500/25 shadow-glass space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl glass-emerald flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>المساعد الذكي لإدارة المحتوى</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              محادثة ذكية مباشرة لأمر الذكاء الاصطناعي باستيراد وإدارة بيانات المنصة
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 glass-emerald px-3 py-1 rounded-full">
          نشط ومتصل
        </span>
      </div>

      {/* Quick Actions Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(qp.prompt)}
            disabled={loading}
            className="btn-glass px-3 py-1.5 rounded-xl whitespace-nowrap text-slate-700 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500/30 transition-all shrink-0 text-xs"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="h-80 overflow-y-auto space-y-3 p-3 glass-elevated rounded-2xl border border-white/05 text-xs">
        {messages.map((msg) => {
          const isAi = msg.sender === "ai";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}
            >
              {isAi && (
                <div className="w-7 h-7 rounded-xl glass-emerald flex items-center justify-center shrink-0 text-emerald-400 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl leading-relaxed ${
                  isAi
                    ? "glass-card border border-emerald-500/20 text-slate-800 dark:text-slate-100"
                    : "bg-emerald-600 text-white font-medium"
                }`}
              >
                <div className="whitespace-pre-line text-xs sm:text-sm">{msg.text}</div>
                <div
                  className={`text-[10px] mt-1.5 opacity-70 ${
                    isAi ? "text-slate-400" : "text-emerald-100 text-left"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAi && (
                <div className="w-7 h-7 rounded-xl bg-slate-700 flex items-center justify-center shrink-0 text-white mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <div className="w-6 h-6 rounded-lg glass-emerald flex items-center justify-center text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span>المساعد يفكر ويقوم بتنفيذ الأمر...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="اكتب أمراً للـ AI (مثال: نزل أحاديث صحيح مسلم، أو استورد صحيح البخاري)..."
          disabled={loading}
          className="flex-1 glass-card text-xs sm:text-sm rounded-2xl px-4 py-3 border border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
        />

        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="btn-glass-emerald px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">إرسال</span>
        </button>
      </div>
    </div>
  );
}
