"use client";

import React, { useState } from "react";
import { BookOpen, Plus, Check, Clock, ExternalLink, ShieldCheck, Play } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { VERIFIED_LESSONS, VERIFIED_SCHOLARS } from "@/lib/data/verified-data";
import { Lesson, ContentStatus } from "@/types";

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>(VERIFIED_LESSONS);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [scholarId, setScholarId] = useState(VERIFIED_SCHOLARS[2]?.id || "");
  const [mediaUrl, setMediaUrl] = useState("");
  const [duration, setDuration] = useState("45");
  const [publisher, setPublisher] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newLesson: Lesson = {
      id: `ls-${Date.now()}`,
      slug: title.trim().replace(/\s+/g, "-").toLowerCase(),
      title: title.trim(),
      scholar_id: scholarId,
      scholar: VERIFIED_SCHOLARS.find((s) => s.id === scholarId) || null,
      media_url: mediaUrl.trim() || null,
      media_type: "audio",
      duration_minutes: parseInt(duration, 10) || 40,
      description: description.trim(),
      status: "in_review",
      published_date: new Date().toISOString().split("T")[0],
      sources: publisher.trim()
        ? [
            {
              id: `src-${Date.now()}`,
              lesson_id: `ls-${Date.now()}`,
              title: title.trim(),
              original_url: mediaUrl.trim() || "https://midad.org",
              publisher: publisher.trim(),
              is_verified: false,
            },
          ]
        : [],
    };

    setLessons([newLesson, ...lessons]);
    setShowAddForm(false);
    setTitle("");
    setMediaUrl("");
    setDescription("");
    setPublisher("");
  };

  const handleStatusChange = (id: string, newStatus: ContentStatus) => {
    setLessons(
      lessons.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>إدارة الدروس والمحاضرات</span>
          </h2>
          <p className="text-xs text-slate-500">
            إدراج ومراجعة الشروح الصوتية والتحقق من روابط التسجيل الأصلية
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? "outline" : "primary"}
          size="sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "إلغاء النموذج" : "إضافة درس جديد"}</span>
        </Button>
      </div>

      {/* Add Lesson Form */}
      {showAddForm && (
        <Card className="p-6 border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>تسجيل درس جديد (مع فحص الرابط الأصلي)</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="عنوان الدرس والمحاضرة *"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: شرح كتاب الصيام من زاد المستقنع"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  العالم المحاضر *
                </label>
                <select
                  value={scholarId}
                  onChange={(e) => setScholarId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  {VERIFIED_SCHOLARS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="المدة بالدقائق"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="رابط الملف الصوتي المعتمد (MP3 / Audio URL)"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://..."
              />
              <Input
                label="الجهة الناشرة الأصلية"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="مثال: موقع الشيخ الرسمي، إذاعة القرآن الكريم"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                نبذة وتفريغ المحاضرة
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ملخص محاور الدرس والمسائل الفقهية المطروحة..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" variant="primary" size="sm">
                إدراج الدرس للمراجعة
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lessons List */}
      <div className="space-y-3">
        {lessons.map((l) => (
          <Card key={l.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {l.title}
                </h4>
                <Badge
                  variant={
                    l.status === "published"
                      ? "emerald"
                      : l.status === "in_review"
                      ? "amber"
                      : "slate"
                  }
                >
                  {l.status === "published"
                    ? "منشور"
                    : l.status === "in_review"
                    ? "قيد المراجعة"
                    : "مسودة"}
                </Badge>
              </div>

              <p className="text-xs text-slate-500">
                {l.scholar?.name} • {l.duration_minutes} دقيقة • {l.media_type === "audio" ? "صوتي" : "مرئي"}
              </p>

              {l.sources?.[0] && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
                  <span>المصدر: {l.sources[0].publisher || l.sources[0].title}</span>
                  {l.sources[0].original_url && (
                    <a
                      href={l.sources[0].original_url}
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

            <div className="flex items-center gap-2 self-end sm:self-center">
              {l.status !== "published" ? (
                <Button
                  onClick={() => handleStatusChange(l.id, "published")}
                  variant="primary"
                  size="sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>اعتماد ونشر</span>
                </Button>
              ) : (
                <Button
                  onClick={() => handleStatusChange(l.id, "in_review")}
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
