"use client";

import React, { useState } from "react";
import { Scroll, Plus, Check, Clock, ExternalLink, ShieldCheck, Eye } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { VERIFIED_HADITHS } from "@/lib/data/verified-data";
import { Hadith, ContentStatus } from "@/types";
import { normalizeArabic } from "@/lib/arabic-utils";

export default function AdminHadithsPage() {
  const [hadiths, setHadiths] = useState<Hadith[]>(VERIFIED_HADITHS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewItem, setPreviewItem] = useState<Hadith | null>(null);

  // Form states
  const [hadithNumber, setHadithNumber] = useState("");
  const [arabicText, setArabicText] = useState("");
  const [narrator, setNarrator] = useState("");
  const [grade, setGrade] = useState("صحيح");
  const [takhrij, setTakhrij] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [explanation, setExplanation] = useState("");
  const [sourceBook, setSourceBook] = useState("صحيح البخاري");
  const [sourceUrl, setSourceUrl] = useState("https://sunnah.com/bukhari:1");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arabicText.trim() || !takhrij.trim()) return;

    const num = parseInt(hadithNumber, 10) || hadiths.length + 1;

    const newHadith: Hadith = {
      id: `hd-${Date.now()}`,
      collection_id: "coll-bukhari",
      hadith_number: num,
      arabic_text: arabicText.trim(),
      arabic_normalized: normalizeArabic(arabicText.trim()),
      narrator: narrator.trim() || null,
      grade: grade.trim() || "صحيح",
      takhrij: takhrij.trim(),
      chapter_title: chapterTitle.trim() || null,
      explanation: explanation.trim() || null,
      status: "in_review", // إلزامياً: لا يُنشر فوراً
      created_at: new Date().toISOString(),
      sources: [
        {
          id: `src-${Date.now()}`,
          hadith_id: `hd-${Date.now()}`,
          reference_book: sourceBook.trim(),
          hadith_number_in_source: String(num),
          verified_url: sourceUrl.trim() || null,
          is_verified: true,
          verified_at: new Date().toISOString(),
        },
      ],
    };

    setHadiths([newHadith, ...hadiths]);
    setShowAddForm(false);
    setArabicText("");
    setNarrator("");
    setTakhrij("");
    setExplanation("");
  };

  const handleStatusChange = (id: string, newStatus: ContentStatus) => {
    setHadiths(
      hadiths.map((h) => (h.id === id ? { ...h, status: newStatus } : h))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scroll className="w-5 h-5 text-emerald-600" />
            <span>إدارة وضبط الأحاديث النبوية</span>
          </h2>
          <p className="text-xs text-slate-500">
            مراجعة متون الأحاديث وتخريجها ودرجة صحتها قبل إتاحتها للجمهور
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? "outline" : "primary"}
          size="sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "إلغاء النموذج" : "إدراج حديث للمراجعة"}</span>
        </Button>
      </div>

      {/* Add Hadith Form */}
      {showAddForm && (
        <Card className="p-6 border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>إدراج حديث نبوي للمراجعة والتحقيق</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="رقم الحديث *"
                type="number"
                required
                value={hadithNumber}
                onChange={(e) => setHadithNumber(e.target.value)}
                placeholder="1"
              />
              <Input
                label="درجة الصحة *"
                required
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="صحيح (متفق عليه)"
              />
              <Input
                label="الصحابي الراوي"
                value={narrator}
                onChange={(e) => setNarrator(e.target.value)}
                placeholder="مثال: عمر بن الخطاب رضي الله عنه"
              />
            </div>

            <Input
              label="عنوان الباب الفقهي"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="مثال: باب كيف كان بدء الوحي إلى رسول الله ﷺ"
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                متن الحديث الشريف المسند *
              </label>
              <textarea
                required
                rows={4}
                value={arabicText}
                onChange={(e) => setArabicText(e.target.value)}
                placeholder="حَدَّثَنَا ... قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ يَقُولُ: «...»"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-traditional leading-[2.2] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="التخريج المعتمد *"
                required
                value={takhrij}
                onChange={(e) => setTakhrij(e.target.value)}
                placeholder="صحيح البخاري (حديث رقم 1) - صحيح مسلم (1907)"
              />
              <Input
                label="رابط المرجع الرقمي للتحقق"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://sunnah.com/bukhari:1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                الشرح الميسر الموثق
              </label>
              <textarea
                rows={2}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="بيان معاني المفردات والفوائد العقدية والفقهية المستنبطة..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" variant="primary" size="sm">
                حفظ وإحالة للجنة التحقيق
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Preview Modal / Drawer */}
      {previewItem && (
        <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 border border-emerald-500/40 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-400">
              معاينة الحديث قبل النشر (حديث رقم {previewItem.hadith_number})
            </span>
            <button
              onClick={() => setPreviewItem(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              إغلاق المعاينة ✕
            </button>
          </div>
          <div className="font-traditional text-lg leading-[2.4] text-justify">
            «{previewItem.arabic_text}»
          </div>
          <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
            <p>التخريج: {previewItem.takhrij}</p>
            <p>درجة الصحة: {previewItem.grade}</p>
            <p>الشرح: {previewItem.explanation}</p>
          </div>
        </div>
      )}

      {/* Hadiths List */}
      <div className="space-y-3">
        {hadiths.map((h) => (
          <Card key={h.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    h.status === "published"
                      ? "emerald"
                      : h.status === "in_review"
                      ? "amber"
                      : "slate"
                  }
                >
                  {h.status === "published"
                    ? "منشور ومعتمد"
                    : h.status === "in_review"
                    ? "قيد المراجعة"
                    : "مسودة"}
                </Badge>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  حديث رقم {h.hadith_number} • {h.grade}
                </span>
              </div>

              <p className="font-traditional text-sm sm:text-base text-slate-800 dark:text-slate-200 line-clamp-2 leading-[2]">
                «{h.arabic_text}»
              </p>

              <p className="text-xs text-slate-500">
                {h.takhrij} {h.narrator ? `• عن: ${h.narrator}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => setPreviewItem(h)}
                className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="معاينة"
              >
                <Eye className="w-4 h-4" />
              </button>

              {h.status !== "published" ? (
                <Button
                  onClick={() => handleStatusChange(h.id, "published")}
                  variant="primary"
                  size="sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>اعتماد ونشر</span>
                </Button>
              ) : (
                <Button
                  onClick={() => handleStatusChange(h.id, "in_review")}
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
