"use client";

import React, { useState } from "react";
import { GraduationCap, Plus, Check, Clock, ExternalLink, ShieldCheck, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { VERIFIED_SCHOLARS } from "@/lib/data/verified-data";
import { Scholar, ContentStatus } from "@/types";

export default function AdminScholarsPage() {
  const [scholars, setScholars] = useState<Scholar[]>(VERIFIED_SCHOLARS);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [era, setEra] = useState("");
  const [deathYear, setDeathYear] = useState("");
  const [bio, setBio] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !bio.trim()) return;

    const newScholar: Scholar = {
      id: `sch-${Date.now()}`,
      slug: name.trim().replace(/\s+/g, "-").toLowerCase(),
      name: name.trim(),
      title: title.trim() || null,
      era: era.trim() || "معاصر",
      is_contemporary: !deathYear,
      death_year: deathYear ? parseInt(deathYear, 10) : null,
      bio: bio.trim(),
      status: "in_review", // لا يُنشر فوراً؛ يدخل مرحلة المراجعة والتوثيق
      verified_at: null,
      created_at: new Date().toISOString(),
      sources: sourceTitle.trim()
        ? [
            {
              id: `src-${Date.now()}`,
              scholar_id: `sch-${Date.now()}`,
              title: sourceTitle.trim(),
              url: sourceUrl.trim() || null,
              is_verified: false,
            },
          ]
        : [],
    };

    setScholars([newScholar, ...scholars]);
    setShowAddForm(false);
    // Reset form
    setName("");
    setTitle("");
    setEra("");
    setDeathYear("");
    setBio("");
    setSourceTitle("");
    setSourceUrl("");
  };

  const handleStatusChange = (id: string, newStatus: ContentStatus) => {
    setScholars(
      scholars.map((s) =>
        s.id === id
          ? {
              ...s,
              status: newStatus,
              verified_at: newStatus === "published" ? new Date().toISOString() : s.verified_at,
            }
          : s
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <span>إدارة العلماء والدعاة</span>
          </h2>
          <p className="text-xs text-slate-500">
            إضافة وتوثيق تراجم العلماء وربطها بالمصادر التاريخية المعتمدة
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? "outline" : "primary"}
          size="sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "إلغاء النموذج" : "إضافة عالم جديد"}</span>
        </Button>
      </div>

      {/* Add Scholar Form */}
      {showAddForm && (
        <Card className="p-6 border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>تسجيل عالم جديد (يتطلب التوثيق ومصدر الترجمة)</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="اسم العالم الكامل *"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: الإمام أحمد بن حنبل"
              />
              <Input
                label="اللقب والكنية"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: إمام أهل السنة والجماعة"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="العصر التاريخي"
                value={era}
                onChange={(e) => setEra(e.target.value)}
                placeholder="مثال: القرن الثالث الهجري"
              />
              <Input
                label="سنة الوفاة (بالهجري - اترك فارغاً إذا كان حياً معاصراً)"
                type="number"
                value={deathYear}
                onChange={(e) => setDeathYear(e.target.value)}
                placeholder="مثال: 241"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                النبذة والترجمة الموثقة *
              </label>
              <textarea
                required
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="اكتب ترجمة العالم ومكانته وتلاميذه مع الالتزام بالدقة التاريخية..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                توثيق مصدر الترجمة (مرجع تاريخي محقق):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="اسم المرجع (مثال: سير أعلام النبلاء - ج 11 ص 177)"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                />
                <Input
                  placeholder="رابط المصدر الرقمي (https://shamela.ws/...)"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" variant="primary" size="sm">
                حفظ وإدراج للمراجعة
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Scholars Table / List */}
      <div className="space-y-3">
        {scholars.map((s) => (
          <Card key={s.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {s.name}
                </h4>
                <Badge
                  variant={
                    s.status === "published"
                      ? "emerald"
                      : s.status === "in_review"
                      ? "amber"
                      : "slate"
                  }
                >
                  {s.status === "published"
                    ? "منشور ومعتمد"
                    : s.status === "in_review"
                    ? "قيد المراجعة"
                    : "مسودة"}
                </Badge>
              </div>

              <p className="text-xs text-slate-500">
                {s.title} • {s.era} {s.death_year ? `• وفاة: ${s.death_year} هـ` : ""}
              </p>

              {s.sources?.[0] && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
                  <span>المصدر: {s.sources[0].title}</span>
                  {s.sources[0].url && (
                    <a
                      href={s.sources[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline flex items-center gap-0.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Workflow status controller */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {s.status !== "published" ? (
                <Button
                  onClick={() => handleStatusChange(s.id, "published")}
                  variant="primary"
                  size="sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>اعتماد ونشر</span>
                </Button>
              ) : (
                <Button
                  onClick={() => handleStatusChange(s.id, "in_review")}
                  variant="outline"
                  size="sm"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>إعادة للمراجعة</span>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
