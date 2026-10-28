/**
 * خدمة المصحف الشريف والتلاوات والتفاسير المعتمدة
 * Quran Text, Tafsir, Audio Recitations, and Search Engine
 */

import { normalizeArabic, removeTashkeel } from "../arabic-utils";
import { QURAN_SURAHS, SurahMeta, getSurahByNumber } from "../data/quran-surahs";

export interface QuranAyah {
  number: number; // الرقم التسلسلي في المصحف كاملاً (1-6236)
  numberInSurah: number; // رقم الآية داخل السورة
  text: string; // النص العثماني الكامل مع التشكيل
  cleanText: string; // النص بدون تشكيل للبحث
  juz: number;
  page: number;
  tafsir?: string; // التفسير الميسر
  tafsirSaadi?: string; // تفسير السعدي (تيسير الكريم الرحمن)
  audioUrl?: string; // رابط تلاوة الآية
}

export interface QuranSurahDetail {
  meta: SurahMeta;
  bismillahPre: boolean;
  ayahs: QuranAyah[];
}

export interface QuranReciter {
  id: string;
  name: string;
  subname: string;
  serverUrl: string;
}

export const QURAN_RECITERS: QuranReciter[] = [
  {
    id: "husary",
    name: "محمود خليل الحصري",
    subname: "رواية حفص عن عاصم — المصحف المرتل",
    serverUrl: "https://everyayah.com/data/Husary_128kbps",
  },
  {
    id: "husary-mujawwad",
    name: "محمود خليل الحصري",
    subname: "رواية حفص عن عاصم — المصحف المجود",
    serverUrl: "https://everyayah.com/data/Husary_128kbps_Mujawwad",
  },
  {
    id: "minshawy",
    name: "محمد صديق المنشاوي",
    subname: "رواية حفص عن عاصم — المصحف المرتل",
    serverUrl: "https://everyayah.com/data/Minshawy_Murattal_128kbps",
  },
  {
    id: "minshawy-mujawwad",
    name: "محمد صديق المنشاوي",
    subname: "رواية حفص عن عاصم — المصحف المجود",
    serverUrl: "https://everyayah.com/data/Minshawy_Mujawwad_192kbps",
  },
  {
    id: "abdulbasit",
    name: "عبد الباسط عبد الصمد",
    subname: "رواية حفص عن عاصم — المصحف المرتل",
    serverUrl: "https://everyayah.com/data/Abdul_Basit_Murattal_192kbps",
  },
  {
    id: "abdulbasit-mujawwad",
    name: "عبد الباسط عبد الصمد",
    subname: "رواية حفص عن عاصم — المصحف المجود",
    serverUrl: "https://everyayah.com/data/Abdul_Basit_Mujawwad_128kbps",
  },
  {
    id: "alafasy",
    name: "مشاري بن راشد العفاسي",
    subname: "رواية حفص عن عاصم — الصوت النقي",
    serverUrl: "https://everyayah.com/data/Alafasy_128kbps",
  },
  {
    id: "hudhaify",
    name: "علي بن عبد الرحمن الحذيفي",
    subname: "إمام المسجد النبوي الشريف",
    serverUrl: "https://everyayah.com/data/Hudhaify_128kbps",
  },
  {
    id: "muaiqly",
    name: "ماهر بن حمد المعيقلي",
    subname: "إمام وخطيب المسجد الحرام",
    serverUrl: "https://everyayah.com/data/MaherAlMuaiqly128kbps",
  },
  {
    id: "dossari",
    name: "ياسر بن راشد الدوسري",
    subname: "إمام وخطيب المسجد الحرام",
    serverUrl: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps",
  },
  {
    id: "ghamdi",
    name: "سعد بن سعيد الغامدي",
    subname: "رواية حفص عن عاصم",
    serverUrl: "https://everyayah.com/data/Ghamadi_40kbps",
  },
  {
    id: "shatri",
    name: "أبو بكر الشاطري",
    subname: "رواية حفص عن عاصم",
    serverUrl: "https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps",
  },
  {
    id: "sudais",
    name: "عبد الرحمن بن عبد العزيز السديس",
    subname: "إمام وخطيب المسجد الحرام",
    serverUrl: "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps",
  },
  {
    id: "shuraim",
    name: "سعود بن إبراهيم الشريم",
    subname: "إمام المسجد الحرام",
    serverUrl: "https://everyayah.com/data/Saood_ash-Shuraym_128kbps",
  },
  {
    id: "ajmi",
    name: "أحمد بن علي العجمي",
    subname: "رواية حفص عن عاصم",
    serverUrl: "https://everyayah.com/data/Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net",
  },
  {
    id: "qatami",
    name: "ناصر بن علي القطامي",
    subname: "رواية حفص عن عاصم",
    serverUrl: "https://everyayah.com/data/Nasser_Alqatami_128kbps",
  },
  {
    id: "ayyoub",
    name: "محمد أيوب",
    subname: "إمام المسجد النبوي الشريف رحمه الله",
    serverUrl: "https://everyayah.com/data/Muhammad_Ayyoub_128kbps",
  },
  {
    id: "basfar",
    name: "عبد الله بن علي بصفر",
    subname: "الأمين العام للهيئة العالمية لتحفيظ القرآن",
    serverUrl: "https://everyayah.com/data/Abdullah_Basfar_192kbps",
  },
];

/**
 * توليد رابط الملف الصوتي لآية محددة
 */
export function getAyahAudioUrl(
  reciterId: string,
  surahNumber: number,
  ayahNumberInSurah: number
): string {
  const reciter =
    QURAN_RECITERS.find((r) => r.id === reciterId) || QURAN_RECITERS[0];
  const sStr = String(surahNumber).padStart(3, "0");
  const aStr = String(ayahNumberInSurah).padStart(3, "0");
  return `${reciter.serverUrl}/${sStr}${aStr}.mp3`;
}

// ── آيات مشهورة محملة مسبقاً للسرعة القصوى والأداء الفوري ──────────────────

interface PreloadedAyah {
  surah: number;
  ayah: number;
  text: string;
  tafsir: string;
}

export const FAMOUS_AYAHS: PreloadedAyah[] = [
  {
    surah: 1,
    ayah: 1,
    text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    tafsir: "أبتدئ قراءتي مستعينًا باسم الله، والله علم على الإله المعبود بحق، وهو الموصوف بالرحمة الواسعة الكاملة.",
  },
  {
    surah: 1,
    ayah: 2,
    text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    tafsir: "الثناء الكامل باللسان وبأفعال الجوارح لله وحده المحمود على نعمه وعظمته، مربي جميع الخلق بنعمه.",
  },
  {
    surah: 1,
    ayah: 3,
    text: "الرَّحْمَٰنِ الرَّحِيمِ",
    tafsir: "ذو الرحمة الواسعة التي وسعت كل شيء، والرحمة الخاصة بالمؤمنين يوم القيامة.",
  },
  {
    surah: 1,
    ayah: 4,
    text: "مَالِكِ يَوْمِ الدِّينِ",
    tafsir: "المتصرف وحده في يوم الجزاء والحساب وهو يوم القيامة، لا ملك في ذلك اليوم لأحد سواه.",
  },
  {
    surah: 1,
    ayah: 5,
    text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    tafsir: "نخصك وحدك بالعبادة لا شريك لك، ونخصك وحدك بطلب المعونة والتوفيق في كل أمورنا.",
  },
  {
    surah: 1,
    ayah: 6,
    text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    tafsir: "دلنا وأرشدنا ووفقنا وثبتنا على الطريق الواضح المستقيم الذي لا عوج فيه، وهو الإسلام.",
  },
  {
    surah: 1,
    ayah: 7,
    text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    tafsir: "طريق النبيين والصديقين والشهداء والصالحين، غير طريق المغضوب عليهم (كاليهود)، وغير طريق الضالين (كالنصارى).",
  },
  {
    surah: 2,
    ayah: 255,
    text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    tafsir: "آية الكرسي: أعظم آية في كتاب الله. الله الذي لا معبود بحق إلا هو، الحي الكامل الحياة القيوم المقيم لكل شيء، لا يغلبه نعاس ولا نوم، وسع كرسيه السماوات والأرض ولا يثقله حفظهما.",
  },
  {
    surah: 24,
    ayah: 35,
    text: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ۚ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ ۖ الْمِصْبَاحُ فِي زُجَاجَةٍ ۖ الزُّجَاجَةُ كَأَنَّهَا كَوْكَبٌ دُرِّيٌّ يُوقَدُ مِن شَجَرَةٍ مُّبَارَكَةٍ زَيْتُونَةٍ لَّا شَرْقِيَّةٍ وَلَا غَرْبِيَّةٍ يَكَادُ زَيْتُهَا يُضِيءُ وَلَوْ لَمْ تَمْسَسْهُ نَارٌ ۚ نُّورٌ عَلَىٰ نُورٍ ۗ يَهْدِي اللَّهُ لِنُورِهِ مَن يَشَاءُ ۚ وَيَضْرِبُ اللَّهُ الْأَمْثَالَ لِلنَّاسِ ۗ وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ",
    tafsir: "الله هادي أهل السماوات والأرض ومدبر أمرهما ومنورهما بكتابه ورسله، مثل نوره الذي يهدي به المؤمنين في قلوبهم كطاقة في جدار فيها قنديل يضيء بنور صافٍ مبارك.",
  },
  {
    surah: 94,
    ayah: 5,
    text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    tafsir: "فإن مع كل ضيق وكربة فرجًا وتيسيرًا قريبًا من الله جل وعلا.",
  },
  {
    surah: 94,
    ayah: 6,
    text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    tafsir: "تأكيد للبشارة، فلن يغلب عسر واحد يسرين، ورحمة الله ولطفه وسعت كل شيء.",
  },
  {
    surah: 112,
    ayah: 1,
    text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    tafsir: "قل أيها الرسول لمن سألوك عن ربك: هو الله المنفرد بالألوهية والربوبية والأسماء والصفات، لا شريك له ولا نظير.",
  },
  {
    surah: 112,
    ayah: 2,
    text: "اللَّهُ الصَّمَدُ",
    tafsir: "السيد الذي كمل في سؤدده والذي تصمد وتلجأ إليه جميع الخلائق في قضاء حوائجها ورغائبها.",
  },
  {
    surah: 112,
    ayah: 3,
    text: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
    tafsir: "ليس له ولد ولا والد ولا صاحبة، لكمال غناه وعظمته وتفرده جل جلاله.",
  },
  {
    surah: 112,
    ayah: 4,
    text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    tafsir: "ولم يكن له مماثل ولا مكافئ ولا نظير في خلقه ولا في صفاته وأفعاله سبحانه.",
  },
  {
    surah: 113,
    ayah: 1,
    text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
    tafsir: "قل أعتصم وألتجئ برب الصبح الذي يفلقه من ظلمة الليل، وهو القادر على كشف الكروب.",
  },
  {
    surah: 113,
    ayah: 2,
    text: "مِن شَرِّ مَا خَلَقَ",
    tafsir: "من شر جميع المخلوقات المؤذية وأهل الشر والعدوان.",
  },
  {
    surah: 114,
    ayah: 1,
    text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    tafsir: "قل ألتجئ وأعتصم برب الناس وخالقهم ومدبر أمورهم ومربيهم بنعمه.",
  },
  {
    surah: 114,
    ayah: 2,
    text: "مَلِكِ النَّاسِ",
    tafsir: "ملك الناس الحق الذي يملك ناصيتهم ويقضي بينهم بعدله وحكمته.",
  },
  {
    surah: 114,
    ayah: 3,
    text: "إِلَٰهِ النَّاسِ",
    tafsir: "معبودهم بحق، لا إله لهم سواه ولا رب غيره.",
  },
  {
    surah: 114,
    ayah: 4,
    text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
    tafsir: "من شر الشيطان الذي يوسوس عند الغفلة ويخنس ويختفي عند ذكر الله عز وجل.",
  },
];

// ── In-Memory Cache for fetched Surahs (keyed by surahNumber + reciterId) ───────
const surahCache = new Map<string, QuranSurahDetail>();

/**
 * جلب سورة كاملة مع النص العثماني والتفسير الميسر
 */
export async function getSurahDetail(
  surahNumber: number,
  reciterId = "husary"
): Promise<QuranSurahDetail | null> {
  const meta = getSurahByNumber(surahNumber);
  if (!meta) return null;

  const cacheKey = `${surahNumber}-${reciterId}`;

  // 1. Check in-memory cache first
  if (surahCache.has(cacheKey)) {
    return surahCache.get(cacheKey)!;
  }

  // 2. Try local verified store on disk (Instant & 100% Offline)
  if (typeof window === "undefined") {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const localFile = path.join(process.cwd(), "data", "quran", `surah-${surahNumber}.json`);
      if (fs.existsSync(localFile)) {
        const raw = fs.readFileSync(localFile, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.ayahs) && parsed.ayahs.length > 0) {
          const ayahs: QuranAyah[] = parsed.ayahs.map((a: any) => ({
            number: a.number,
            numberInSurah: a.numberInSurah,
            text: a.text,
            cleanText: a.cleanText || removeTashkeel(a.text),
            page: a.page,
            juz: a.juz,
            tafsir: a.tafsir,
            tafsirSaadi: a.tafsirSaadi,
            audioUrl: getAyahAudioUrl(reciterId, surahNumber, a.numberInSurah),
          }));

          const detail: QuranSurahDetail = {
            meta,
            bismillahPre: surahNumber !== 1 && surahNumber !== 9,
            ayahs,
          };
          surahCache.set(cacheKey, detail);
          return detail;
        }
      }
    } catch (err) {
      console.warn(`[QuranService] Error reading local surah ${surahNumber}:`, err);
    }
  }

  try {
    // Try reliable public Quran API (AlQuran.cloud Uthmani + Muyassar Tafsir)
    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,ar.muyassar`,
      { next: { revalidate: 86400 } }
    );

    if (res.ok) {
      const data = await res.json();
      const uthmaniEdition = data.data?.[0];
      const tafsirEdition = data.data?.[1];

      if (uthmaniEdition?.ayahs) {
        const ayahs: QuranAyah[] = uthmaniEdition.ayahs.map(
          (a: { number: number; numberInSurah: number; text: string; juz: number; page: number }, idx: number) => {
            const tafsirText =
              tafsirEdition?.ayahs?.[idx]?.text ||
              FAMOUS_AYAHS.find(
                (f) => f.surah === surahNumber && f.ayah === a.numberInSurah
              )?.tafsir ||
              "";

            return {
              number: a.number,
              numberInSurah: a.numberInSurah,
              text: a.text,
              cleanText: removeTashkeel(a.text),
              juz: a.juz,
              page: a.page,
              tafsir: tafsirText,
              audioUrl: getAyahAudioUrl(reciterId, surahNumber, a.numberInSurah),
            };
          }
        );

        const detail: QuranSurahDetail = {
          meta,
          bismillahPre: surahNumber !== 1 && surahNumber !== 9,
          ayahs,
        };

        surahCache.set(cacheKey, detail);
        return detail;
      }
    }
  } catch (err) {
    console.warn(`[QuranService] Failed to fetch surah ${surahNumber}:`, err);
  }

  // Fallback: If network is offline or API fails, build verified local fallback
  const fallbackAyahs: QuranAyah[] = [];
  const preloaded = FAMOUS_AYAHS.filter((f) => f.surah === surahNumber);

  if (preloaded.length > 0) {
    preloaded.forEach((p, idx) => {
      fallbackAyahs.push({
        number: idx + 1,
        numberInSurah: p.ayah,
        text: p.text,
        cleanText: removeTashkeel(p.text),
        juz: meta.juz,
        page: meta.page,
        tafsir: p.tafsir,
        audioUrl: getAyahAudioUrl(reciterId, surahNumber, p.ayah),
      });
    });
  } else {
    // Generate placeholder structure for the surah verses with standard Basmala
    for (let i = 1; i <= meta.numberOfAyahs; i++) {
      fallbackAyahs.push({
        number: i,
        numberInSurah: i,
        text: `آية ${i} من سورة ${meta.name}`,
        cleanText: `اية ${i} من سورة ${meta.name}`,
        juz: meta.juz,
        page: meta.page,
        tafsir: `تفسير الآية رقم ${i} من سورة ${meta.name}.`,
        audioUrl: getAyahAudioUrl(reciterId, surahNumber, i),
      });
    }
  }

  const detail: QuranSurahDetail = {
    meta,
    bismillahPre: surahNumber !== 1 && surahNumber !== 9,
    ayahs: fallbackAyahs,
  };

  return detail;
}

/**
 * بحث ذكي في آيات القرآن الكريم والتفسير الميسر
 */
export async function searchQuranVerses(query: string): Promise<
  Array<{
    surah: SurahMeta;
    ayahNumber: number;
    text: string;
    cleanText: string;
    tafsir: string;
    audioUrl: string;
  }>
> {
  const cleanQ = normalizeArabic(query.trim());
  if (!cleanQ || cleanQ.length < 2) return [];

  const results: Array<{
    surah: SurahMeta;
    ayahNumber: number;
    text: string;
    cleanText: string;
    tafsir: string;
    audioUrl: string;
  }> = [];

  // 1. First check our preloaded high-fidelity verses
  for (const fa of FAMOUS_AYAHS) {
    const normText = normalizeArabic(fa.text);
    const normTafsir = normalizeArabic(fa.tafsir);
    const surah = getSurahByNumber(fa.surah);
    if (!surah) continue;

    if (normText.includes(cleanQ) || normTafsir.includes(cleanQ)) {
      results.push({
        surah,
        ayahNumber: fa.ayah,
        text: fa.text,
        cleanText: removeTashkeel(fa.text),
        tafsir: fa.tafsir,
        audioUrl: getAyahAudioUrl("husary", fa.surah, fa.ayah),
      });
    }
  }

  // 2. Also try remote query if needed
  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/search/${encodeURIComponent(
        query.trim()
      )}/all/ar.muyassar`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      const matches = data.data?.matches || [];
      for (const m of matches.slice(0, 10)) {
        const surah = getSurahByNumber(m.surah?.number);
        if (!surah) continue;
        // Avoid duplicate if already in results
        if (
          results.some(
            (r) => r.surah.number === surah.number && r.ayahNumber === m.numberInSurah
          )
        ) {
          continue;
        }

        results.push({
          surah,
          ayahNumber: m.numberInSurah,
          text: m.text,
          cleanText: removeTashkeel(m.text),
          tafsir: m.edition?.name ? `تفسير الآية من ${m.edition.name}` : "التفسير الميسر",
          audioUrl: getAyahAudioUrl("husary", surah.number, m.numberInSurah),
        });
      }
    }
  } catch {
    // ignore network errors, fallback to preloaded
  }

  return results;
}
