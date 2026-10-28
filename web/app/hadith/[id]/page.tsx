import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Scroll } from "lucide-react";
import { getHadithById } from "@/lib/repositories/content-repository";
import { fetchVerifiedHadith } from "@/lib/services/hadith-api";
import { HadithViewer } from "@/components/hadith/HadithViewer";

interface HadithDetailPageProps {
  params: {
    id: string;
  };
}

export default async function HadithDetailPage({ params }: HadithDetailPageProps) {
  let hadith = await getHadithById(params.id);

  // إذا لم يكن موجوداً محلياً، نحاول جلبه برقم الحديث من الواجهة المفتوحة المعتمدة لصحيح البخاري
  if (!hadith) {
    const num = parseInt(params.id.replace(/\D/g, ""), 10);
    if (!isNaN(num) && num > 0) {
      hadith = await fetchVerifiedHadith("ara-bukhari", num);
    }
  }

  if (!hadith) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/hadith"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى كتاب الحديث الشريف</span>
        </Link>
      </div>

      {/* Main Hadith Viewer */}
      <HadithViewer hadith={hadith} />
    </div>
  );
}
