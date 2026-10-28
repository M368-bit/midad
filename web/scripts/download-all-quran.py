#!/usr/bin/env python3
"""
سكريبت التنزيل الشامل لجميع سور القرآن الكريم (114 سورة) مع التفسير الميسر وتفسير السعدي
المصدر: مجمع الملك فهد لطباعة المصحف الشريف عبر واجهة مصحف المدينة الرسمية
"""

import urllib.request
import json
import re
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "data", "quran")

TASHKEEL_REGEX = re.compile(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0640]')

def clean_html(raw_html):
    if not raw_html:
        return ""
    clean = re.sub(r'<[^>]+>', '', raw_html)
    return " ".join(clean.split())

def remove_tashkeel(text):
    if not text:
        return ""
    return TASHKEEL_REGEX.sub('', text)

def fetch_json(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MidadQuran/1.0'})
            with urllib.request.urlopen(req, timeout=15) as res:
                return json.loads(res.read().decode('utf-8'))
        except Exception as e:
            if attempt == retries - 1:
                print(f"[ERR] Failed {url}: {e}", file=sys.stderr)
                return None
            time.sleep(1)

def download_surah(surah_num):
    target_file = os.path.join(OUTPUT_DIR, f"surah-{surah_num}.json")
    if os.path.exists(target_file) and os.path.getsize(target_file) > 500:
        return surah_num, True, "موجود مسبقاً"

    # 1. Fetch Verses
    verses_url = f"https://api.quran.com/api/v4/verses/by_chapter/{surah_num}?language=ar&words=false&fields=text_uthmani,chapter_id,verse_key,verse_number,page_number,juz_number&per_page=300"
    v_data = fetch_json(verses_url)
    if not v_data or 'verses' not in v_data:
        return surah_num, False, "فشل جلب الآيات"
    verses_list = v_data['verses']

    # 2. Fetch Tafsir Muyassar (id 16)
    muyassar_url = f"https://api.quran.com/api/v4/tafsirs/16/by_chapter/{surah_num}?per_page=300"
    m_data = fetch_json(muyassar_url)
    m_tafsirs = m_data.get('tafsirs', []) if m_data else []
    m_map = {t.get('verse_key', ''): clean_html(t.get('text', '')) for t in m_tafsirs}

    # 3. Fetch Tafsir Saadi (id 91)
    saadi_url = f"https://api.quran.com/api/v4/tafsirs/91/by_chapter/{surah_num}?per_page=300"
    s_data = fetch_json(saadi_url)
    s_tafsirs = s_data.get('tafsirs', []) if s_data else []
    s_map = {t.get('verse_key', ''): clean_html(t.get('text', '')) for t in s_tafsirs}

    ayahs = []
    for idx, v in enumerate(verses_list):
        v_num = v.get('verse_number', idx + 1)
        v_key = v.get('verse_key', f"{surah_num}:{v_num}")
        text_uthmani = v.get('text_uthmani', '').strip()
        page = v.get('page_number', 1)
        juz = v.get('juz_number', 1)
        global_id = v.get('id', (surah_num * 1000) + v_num)

        ayahs.append({
            "number": global_id,
            "numberInSurah": v_num,
            "text": text_uthmani,
            "cleanText": remove_tashkeel(text_uthmani),
            "page": page,
            "juz": juz,
            "tafsir": m_map.get(v_key, ""),
            "tafsirSaadi": s_map.get(v_key, ""),
        })

    surah_payload = {
        "surahNumber": surah_num,
        "numberOfAyahs": len(ayahs),
        "bismillahPre": (surah_num != 1 and surah_num != 9),
        "ayahs": ayahs,
    }

    with open(target_file, "w", encoding="utf-8") as f:
        json.dump(surah_payload, f, ensure_ascii=False, indent=2)

    return surah_num, True, f"تم بنجاح ({len(ayahs)} آية)"

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"=== بدء تنزيل وتوثيق جميع سور القرآن الكريم (114 سورة) ===")
    start_time = time.time()
    
    success_count = 0
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(download_surah, s): s for s in range(1, 115)}
        for future in as_completed(futures):
            surah_num, ok, msg = future.result()
            if ok:
                success_count += 1
                if success_count % 10 == 0 or success_count == 114:
                    print(f"[{success_count}/114] سورة {surah_num}: {msg}")
            else:
                print(f"[X] سورة {surah_num}: {msg}", file=sys.stderr)

    elapsed = time.time() - start_time
    print(f"\n✓ اكتمل التنزيل بنجاح! تم حفظ {success_count} سورة في: {OUTPUT_DIR}")
    print(f"الوقت المستغرق: {elapsed:.2f} ثانية.")

if __name__ == "__main__":
    main()
