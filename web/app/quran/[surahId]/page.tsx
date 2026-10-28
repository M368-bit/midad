import React from "react";
import { notFound } from "next/navigation";
import { getSurahDetail, QURAN_RECITERS } from "@/lib/services/quran-service";
import { getSurahByNumber, QURAN_SURAHS } from "@/lib/data/quran-surahs";
import { SurahReaderClient } from "./SurahReaderClient";

interface SurahPageProps {
  params: {
    surahId: string;
  };
  searchParams: {
    ayah?: string;
    reciter?: string;
  };
}

export async function generateMetadata({ params }: SurahPageProps) {
  const surahNum = parseInt(params.surahId, 10);
  const meta = getSurahByNumber(surahNum);
  if (!meta) return { title: "المصحف الشريف | مداد" };

  return {
    title: `سورة ${meta.name} — ${meta.revelationType === "Meccan" ? "مكية" : "مدنية"} (${meta.numberOfAyahs} آيات) | المصحف الشريف | مداد`,
    description: `قراءة واستماع لسورة ${meta.name} كاملة بالرسم العثماني لمصحف المدينة النبوية مع التفسير الميسر وتلاوات مشاهير القراء.`,
  };
}

export default async function SurahPage({ params, searchParams }: SurahPageProps) {
  const surahNum = parseInt(params.surahId, 10);
  if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
    notFound();
  }

  const reciterId = searchParams.reciter || "husary";
  const surahDetail = await getSurahDetail(surahNum, reciterId);

  if (!surahDetail) {
    notFound();
  }

  const initialAyah = searchParams.ayah ? parseInt(searchParams.ayah, 10) : 1;
  const prevSurah = surahNum > 1 ? getSurahByNumber(surahNum - 1) ?? null : null;
  const nextSurah = surahNum < 114 ? getSurahByNumber(surahNum + 1) ?? null : null;

  return (
    <div className="max-w-5xl mx-auto px-1.5 sm:px-6 lg:px-8 py-1.5 sm:py-6 space-y-3 sm:space-y-6">
      <SurahReaderClient
        surah={surahDetail}
        reciters={QURAN_RECITERS}
        initialReciterId={reciterId}
        initialAyah={initialAyah}
        prevSurah={prevSurah}
        nextSurah={nextSurah}
      />
    </div>
  );
}

export async function generateStaticParams() { return Array.from({ length: 114 }, (_, i) => ({ surahId: String(i + 1) })); }
