"use client";

import React, { useState } from "react";
import { FileCheck2, Shield, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AuditLog } from "@/types";

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    user_email: "admin@midad.org",
    action: "PUBLISH",
    entity_type: "hadith",
    entity_id: "hadith-bukhari-1",
    details: { title: "حديث إنما الأعمال بالنيات", grade: "صحيح متفق عليه" },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "log-2",
    user_email: "editor@midad.org",
    action: "VERIFY",
    entity_type: "source",
    entity_id: "src-bk-bukhari",
    details: { url: "https://shamela.ws/book/1680", status: 200, latency_ms: 180 },
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "log-3",
    user_email: "admin@midad.org",
    action: "UPDATE",
    entity_type: "scholar",
    entity_id: "sch-bukhari",
    details: { field: "sources", added: "سير أعلام النبلاء - الذهبي" },
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
  {
    id: "log-4",
    user_email: "editor@midad.org",
    action: "CREATE",
    entity_type: "lesson",
    entity_id: "ls-niyyah-othaymeen",
    details: { title: "شرح حديث إنما الأعمال بالنيات", duration: 48 },
    created_at: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
  },
];

export default function AdminAuditLogsPage() {
  const [logs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const actionLabels: Record<string, { label: string; variant: "emerald" | "amber" | "sky" | "slate" }> = {
    CREATE: { label: "إضافة جديد", variant: "sky" },
    UPDATE: { label: "تعديل بيانات", variant: "slate" },
    VERIFY: { label: "توثيق وفحص مصدر", variant: "emerald" },
    PUBLISH: { label: "اعتماد ونشر", variant: "emerald" },
    DELETE: { label: "حذف أو أرشفة", variant: "amber" },
  };

  const entityLabels: Record<string, string> = {
    scholar: "عالم",
    lesson: "درس صوتي",
    book: "كتاب",
    hadith: "حديث نبوي",
    source: "رابط مصدر",
    user: "مستخدم",
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-emerald-600" />
          <span>سجل العمليات والتدقيق الإداري</span>
        </h2>
        <p className="text-xs text-slate-500">
          تتبع توثيقي دقيق لجميع التعديلات والتحققات وعمليات النشر التي تمت في المنصة
        </p>
      </div>

      <div className="space-y-3">
        {logs.map((log) => {
          const actionMeta = actionLabels[log.action] || {
            label: log.action,
            variant: "slate" as const,
          };

          return (
            <Card key={log.id} className="p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={actionMeta.variant} size="sm">
                    {actionMeta.label}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {entityLabels[log.entity_type] || log.entity_type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({log.entity_id})
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(log.created_at).toLocaleString("ar-SA", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 font-mono">
                {JSON.stringify(log.details, null, 2)}
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>المشرف المنفذ: {log.user_email}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
