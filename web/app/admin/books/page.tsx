"use client";

import React, { useState } from "react";
import { Library, Plus, Check, Clock, ExternalLink, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { VERIFIED_BOOKS, VERIFIED_SCHOLARS } from "@/lib/data/verified-data";
import { Book, ContentStatus, BookUsageRights } from "@/types";

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>(VERIFIED_BOOKS);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [scholarId, setScholarId] = useState(VERIFIED_SCHOLARS[0]?.id || "");
  const [pagesCount, setPagesCount] = useState("300");
  const [volumesCount, setVolumesCount] = useState("1");
  const [usageRights, setUsageRights] = useState<BookUsageRights>("public_domain");
  const [readUrl, setReadUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newBook: Book = {
      id: `bk-${Date.now()}`,
      slug: title.trim().replace(/\s+/g, "-").toLowerCase(),
      title: title.trim(),
      scholar_id: scholarId,
      author: VERIFIED_SCHOLARS.find((s) => s.id === scholarId) || null,
      pages_count: parseInt(pagesCount, 10) || 100,
      volumes_count: parseInt(volumesCount, 10) || 1,
      usage_rights: usageRights,
      read_url: readUrl.trim() || null,
      download_url: downloadUrl.trim() || null,
      description: description.trim(),
      status: "in_review",
      sources: readUrl.trim()
        ? [
            {
              id: `src-${Date.now()}`,
              book_id: `bk-${Date.now()}`,
              source_name: "المكتبة التراثية المعتمدة",
              source_url: readUrl.trim(),
              license_type: usageRights,
              is_verified: true,
            },
          ]
        : [],
    };

    setBooks([newBook, ...books]);
    setShowAddForm(false);
    setTitle("");
    setReadUrl("");
    setDownloadUrl("");
    setDescription("");
  };

  const handleStatusChange = (id: string, newStatus: ContentStatus) => {
    setBooks(
      books.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Library className="w-5 h-5 text-emerald-600" />
            <span>إدارة المكتبة الإسلامية والكتب</span>
          </h2>
          <p className="text-xs text-slate-500">
            فهرسة وتوثيق أمهات كتب التراث مع الالتزام الصارم بحقوق الملكية الفكرية
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? "outline" : "primary"}
          size="sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "إلغاء النموذج" : "إضافة كتاب جديد"}</span>
        </Button>
      </div>

      {/* Add Book Form */}
      {showAddForm && (
        <Card className="p-6 border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>تسجيل كتاب في المكتبة (يشترط أن يكون في النطاق العام أو مصرحاً)</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="عنوان الكتاب *"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: سنن أبي داود"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  المؤلف *
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

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  حقوق الاستخدام *
                </label>
                <select
                  value={usageRights}
                  onChange={(e) => setUsageRights(e.target.value as BookUsageRights)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="public_domain">نطاق عام (تراث مفتوح)</option>
                  <option value="waqf">وقف لله تعالى</option>
                  <option value="publisher_permission">مرخص بإذن الناشر</option>
                </select>
              </div>

              <Input
                label="عدد الصفحات"
                type="number"
                value={pagesCount}
                onChange={(e) => setPagesCount(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="رابط القراءة المعتمد (مثال: المكتبة الشاملة)"
                value={readUrl}
                onChange={(e) => setReadUrl(e.target.value)}
                placeholder="https://shamela.ws/book/..."
              />
              <Input
                label="رابط تحميل PDF المعتمد (المكتبة الوقفية)"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://waqfeya.net/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                نبذة عن الكتاب وقيمته
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="بيان أهمية الكتاب ومنهج مؤلفه..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" variant="primary" size="sm">
                إدراج الكتاب للمراجعة
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Books List */}
      <div className="space-y-3">
        {books.map((b) => (
          <Card key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {b.title}
                </h4>
                <Badge
                  variant={
                    b.status === "published"
                      ? "emerald"
                      : b.status === "in_review"
                      ? "amber"
                      : "slate"
                  }
                >
                  {b.status === "published"
                    ? "منشور"
                    : b.status === "in_review"
                    ? "قيد المراجعة"
                    : "مسودة"}
                </Badge>
              </div>

              <p className="text-xs text-slate-500">
                {b.author?.name} • {b.pages_count} صفحة • حقوق: {b.usage_rights}
              </p>

              {b.sources?.[0] && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
                  <span>المصدر: {b.sources[0].source_name}</span>
                  {b.sources[0].source_url && (
                    <a
                      href={b.sources[0].source_url}
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
              {b.status !== "published" ? (
                <Button
                  onClick={() => handleStatusChange(b.id, "published")}
                  variant="primary"
                  size="sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>اعتماد ونشر</span>
                </Button>
              ) : (
                <Button
                  onClick={() => handleStatusChange(b.id, "in_review")}
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
