/**
 * lib/ai-content-store.ts
 *
 * Persistent storage for AI-imported hadiths.
 * Data is saved to a local JSON file on disk so it survives server restarts.
 *
 * Strategy:
 *  - On module load: read the JSON file from disk into the in-memory Map.
 *  - On every addImportedHadith: update the Map + schedule a debounced flush.
 *  - Flush writes the entire Map to disk as JSON (≈ atomic via temp-file rename).
 *  - clearImportedHadiths: clears Map + deletes the file.
 *
 * File location: <project-root>/data/ai-hadiths.json
 * (Created automatically; committed to .gitignore if needed.)
 */

import { Hadith } from "@/types";
import fs from "fs";
import path from "path";

// ── File path ──────────────────────────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "ai-hadiths.json");
const TMP_FILE = DATA_FILE + ".tmp";

// ── Ensure data directory exists ───────────────────────────────────────────────
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
} catch {
  // ignore — may fail in read-only environments
}

// ── Load persisted data on startup ────────────────────────────────────────────
const importedHadiths = new Map<string, Hadith>();

function loadFromDisk(): void {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const arr: Hadith[] = JSON.parse(raw) as Hadith[];
    if (!Array.isArray(arr)) return;
    for (const h of arr) {
      if (h?.id) importedHadiths.set(h.id, h);
    }
    console.log(
      `[ai-content-store] ✓ Loaded ${importedHadiths.size} persisted hadiths from disk.`
    );
  } catch (err) {
    console.warn("[ai-content-store] Could not load persisted hadiths:", err);
  }
}

loadFromDisk();

// ── Debounced flush to disk ────────────────────────────────────────────────────
let _flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_DEBOUNCE_MS = 2000; // write after 2 s of inactivity

function schedulFlush(): void {
  if (_flushTimer) clearTimeout(_flushTimer);
  _flushTimer = setTimeout(() => {
    flushToDisk();
  }, FLUSH_DEBOUNCE_MS);
}

function flushToDisk(): void {
  try {
    const arr = Array.from(importedHadiths.values());
    const json = JSON.stringify(arr);
    // Write to tmp then rename — safer than direct overwrite
    fs.writeFileSync(TMP_FILE, json, "utf-8");
    fs.renameSync(TMP_FILE, DATA_FILE);
  } catch (err) {
    console.warn("[ai-content-store] Failed to flush hadiths to disk:", err);
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function addImportedHadith(hadith: Hadith): void {
  importedHadiths.set(hadith.id, hadith);
  schedulFlush();
}

export function getImportedHadiths(): Hadith[] {
  return Array.from(importedHadiths.values());
}

export function getImportedHadithById(id: string): Hadith | null {
  if (importedHadiths.has(id)) return importedHadiths.get(id)!;
  // Also try by hadith_number string
  const all = Array.from(importedHadiths.values());
  return all.find((h) => String(h.hadith_number) === id) ?? null;
}

export function clearImportedHadiths(): void {
  importedHadiths.clear();
  try {
    if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE);
    if (fs.existsSync(TMP_FILE)) fs.unlinkSync(TMP_FILE);
  } catch {
    // ignore
  }
}

export function getImportedCount(): number {
  return importedHadiths.size;
}

export function hasImportedHadith(id: string): boolean {
  return importedHadiths.has(id);
}

/** Force-write immediately (call after bulk import completes). */
export function flushNow(): void {
  if (_flushTimer) clearTimeout(_flushTimer);
  flushToDisk();
}
