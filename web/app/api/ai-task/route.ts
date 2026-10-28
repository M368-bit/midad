import { NextRequest, NextResponse } from "next/server";
import {
  createTask,
  updateTask,
  setActiveTaskId,
  getActiveTask,
  getAllTasks,
  setAbortFlag,
  getAbortFlag,
  getActiveTaskId,
} from "@/lib/ai-task-state";
import {
  addImportedHadith,
  hasImportedHadith,
  clearImportedHadiths,
  getImportedCount,
  getImportedHadiths,
  flushNow,
} from "@/lib/ai-content-store";
import {
  fetchVerifiedHadith,
  fetchEntireCollection,
} from "@/lib/services/hadith-api";
import { normalizeArabic } from "@/lib/arabic-utils";

// ── GET: return current task status ───────────────────────────
export async function GET() {
  const active = getActiveTask();
  const all = getAllTasks();
  return NextResponse.json({
    activeTask: active,
    allTasks: all,
    importedCount: getImportedCount(),
  });
}

// ── POST: control task & AI Assistant commands ─────────────────
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    type?: string;
    prompt?: string;
    message?: string;
  };

  const action = body.action ?? "";

  // 1. AI Assistant Chat Command Handler
  if (action === "chat") {
    const rawPrompt = (body.prompt || body.message || "").trim();
    if (!rawPrompt) {
      return NextResponse.json({ reply: "مرحباً بك! كيف يمكنني مساعدتك في إدارة المنصة واستيراد المحتوى؟" });
    }

    const lower = normalizeArabic(rawPrompt.toLowerCase());

    // Check intent: Import Muslim
    if (lower.includes("مسلم") && (lower.includes("نزل") || lower.includes("استورد") || lower.includes("تسطيب") || lower.includes("اضف") || lower.includes("تحميل") || lower.includes("جلب"))) {
      const task = startImportTask("import_muslim");
      return NextResponse.json({
        reply: "أمرك يا مشرفنا الفاضل! بدأت الآن استيراد وتوثيق أحاديث صحيح الإمام مسلم كاملة (أكثر من ٧,٣٠٠ حديث مع الأبواب العربية والأحاديث القدسية) وحفظها فورياً في الذاكرة الدائمة.",
        task,
        executedAction: "start_muslim",
      });
    }

    // Check intent: Import Bukhari
    if (lower.includes("بخاري") && (lower.includes("نزل") || lower.includes("استورد") || lower.includes("تسطيب") || lower.includes("اضف") || lower.includes("تحميل") || lower.includes("جلب"))) {
      const task = startImportTask("import_bukhari");
      return NextResponse.json({
        reply: "أمرك! بدأت الآن استيراد وتوثيق أحاديث صحيح الإمام البخاري كاملة (٧,٥٦٣ حديثاً مسنداً بالرسم والتبويب العربي الخالص) وتخزينها في الذاكرة الدائمة.",
        task,
        executedAction: "start_bukhari",
      });
    }

    // Check intent: Stop
    if (lower.includes("اوقف") || lower.includes("توقف") || lower.includes("وقف")) {
      setAbortFlag(true);
      const active = getActiveTask();
      if (active) {
        updateTask(active.id, {
          status: "paused",
          message: "توقف بأمر المشرف.",
        });
      }
      return NextResponse.json({
        reply: "تم إيقاف عملية الاستيراد الحالية فوراً بناءً على طلبك.",
        executedAction: "stop",
      });
    }

    // Check intent: Clear
    if (lower.includes("احذف") || lower.includes("امسح") || lower.includes("افراغ") || lower.includes("تفريغ")) {
      clearImportedHadiths();
      return NextResponse.json({
        reply: "تم تفريغ مستودع الذاكرة المؤقتة بنجاح، والمنصة جاهزة لاستيراد جديد.",
        executedAction: "clear",
      });
    }

    // Check intent: Status / Stats
    if (lower.includes("كم") || lower.includes("حاله") || lower.includes("احصائ") || lower.includes("وضع")) {
      const count = getImportedCount();
      const active = getActiveTask();
      const activeInfo = active && active.status === "running"
        ? `وهناك مهمة جارية حالياً: "${active.title}" بنسبة إنجاز ${active.progress}%.`
        : "ولا توجد مهام جارية حالياً.";
      return NextResponse.json({
        reply: `المستودع المحلي الدائم يضم حالياً ${count.toLocaleString("ar-EG")} حديثاً مسنداً محفوظاً ومفهرساً على القرص. ${activeInfo}`,
      });
    }

    // Default friendly assistant reply with suggestions
    return NextResponse.json({
      reply: `أهلاً بك! أنا مساعد الذكاء الاصطناعي لإدارة المحتوى. يمكنك أمري بالآتي:\n• «نزل أحاديث صحيح مسلم كاملة»\n• «استورد صحيح البخاري»\n• «أوقف الاستيراد»\n• «أعطني إحصائيات المستودع الحالي»`,
    });
  }

  // 2. Direct Actions
  if (action === "stop") {
    setAbortFlag(true);
    const active = getActiveTask();
    if (active) {
      updateTask(active.id, {
        status: "paused",
        message: "توقف بأمر المشرف.",
      });
    }
    return NextResponse.json({ ok: true, message: "تم إيقاف المهمة." });
  }

  if (action === "clear") {
    clearImportedHadiths();
    return NextResponse.json({ ok: true, message: "تم مسح البيانات المستوردة." });
  }

  if (action === "start") {
    const existing = getActiveTask();
    if (existing && existing.status === "running") {
      return NextResponse.json(
        { error: "توجد مهمة جارية بالفعل. أوقفها أولاً." },
        { status: 409 }
      );
    }

    const type = body.type ?? "import_bukhari";
    const task = startImportTask(type as "import_bukhari" | "import_muslim");
    return NextResponse.json({ ok: true, task });
  }

  return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
}

function startImportTask(type: "import_bukhari" | "import_muslim") {
  const isBukhari = type !== "import_muslim";
  const collection = isBukhari ? "ara-bukhari" : "ara-muslim";
  const total = isBukhari ? 7563 : 7360;
  const title = isBukhari
    ? "استيراد صحيح البخاري كاملاً"
    : "استيراد صحيح مسلم كاملاً";
  const description = isBukhari
    ? `استيراد وتوثيق أحاديث صحيح الإمام البخاري كاملاً مع تصنيف الأحاديث النبوية والقدسية`
    : `استيراد وتوثيق أحاديث صحيح الإمام مسلم كاملاً مع تصنيف الأحاديث النبوية والقدسية`;

  const task = createTask(type, title, description, total);
  setActiveTaskId(task.id);
  setAbortFlag(false);

  // Fire and forget
  void runFastCollectionImport(task.id, collection, total);

  return task;
}

// ── Ultra-Fast Bulk Collection Import Runner ─────────────────────
async function runFastCollectionImport(
  taskId: string,
  collection: "ara-bukhari" | "ara-muslim",
  expectedTotal: number
) {
  updateTask(taskId, {
    status: "running",
    startedAt: new Date().toISOString(),
    message: "جارٍ جلب حزمة الأحاديث الموثقة دفعة واحدة لضمان السرعة الفائقة...",
  });

  try {
    // 1. Fetch entire collection in one rapid request
    const hadiths = await fetchEntireCollection(collection);

    if (hadiths.length === 0) {
      throw new Error("لم يتم استلام أي أحاديث من المصدر الموثوق");
    }

    const total = hadiths.length;
    updateTask(taskId, {
      totalItems: total,
      message: `تم تحميل ${total.toLocaleString("ar-EG")} حديثاً بنجاح. جارٍ المعالجة والتصنيف والحفظ الدائم...`,
    });

    const CHUNK_SIZE = 200;
    let done = 0;
    const importedIds: string[] = [];

    for (let i = 0; i < hadiths.length; i += CHUNK_SIZE) {
      if (getAbortFlag()) {
        updateTask(taskId, {
          status: "paused",
          message: `توقف الاستيراد عند الحديث رقم ${done}.`,
        });
        return;
      }

      const chunk = hadiths.slice(i, i + CHUNK_SIZE);
      for (const h of chunk) {
        addImportedHadith(h);
        importedIds.push(h.id);
        done++;
      }

      const progress = Math.min(Math.round((done / total) * 100), 100);
      updateTask(taskId, {
        doneItems: done,
        failedItems: 0,
        progress,
        currentItem: `معالجة وحفظ حديث رقم ${done} من ${total}`,
        message: `تم حفظ ${done.toLocaleString("ar-EG")} من ${total.toLocaleString("ar-EG")} حديثاً (${progress}%)`,
        importedIds: importedIds.slice(-50),
        errors: [],
      });

      // Small tick so UI receives real-time SSE stream events
      await sleep(40);
    }

    // Force flush to permanent disk
    flushNow();

    updateTask(taskId, {
      status: "completed",
      progress: 100,
      doneItems: total,
      failedItems: 0,
      completedAt: new Date().toISOString(),
      message: `✓ اكتمل بنجاح: تم استيراد وتوثيق ${total.toLocaleString("ar-EG")} حديثاً في الذاكرة الدائمة دون أي خطأ.`,
      errors: [],
    });
  } catch (err) {
    console.warn(`[AITask] Fast import failed, falling back:`, err);
    updateTask(taskId, {
      status: "error",
      message: `حدث خطأ أثناء الاستيراد: ${String(err)}`,
      errors: [String(err)],
    });
  } finally {
    if (getActiveTaskId() === taskId) {
      setActiveTaskId(null);
    }
  }
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
