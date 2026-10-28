#!/usr/bin/env python3
"""
تنزيل جميع صفحات مصحف المدينة النبوية الشريف (604 صفحة بدقة فائقة 1260px)
المصدر: مجمع الملك فهد لطباعة المصحف الشريف / المصحف الرسمي
"""

import urllib.request
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
OUTPUT_DIR = os.path.join(BASE_DIR, "data", "quran", "pages")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def download_page(page_num):
    target_file = os.path.join(OUTPUT_DIR, f"page-{page_num}.png")
    if os.path.exists(target_file) and os.path.getsize(target_file) > 10000:
        return page_num, True, "موجود مسبقاً"

    page_str = str(page_num).zfill(3)
    url = f"https://android.quran.com/data/width_1260/page{page_str}.png"

    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MidadMushaf/1.0'})
            with urllib.request.urlopen(req, timeout=15) as res:
                data = res.read()
                if len(data) > 5000:
                    with open(target_file, "wb") as f:
                        f.write(data)
                    return page_num, True, f"تم بنجاح ({len(data)} بايت)"
        except Exception as e:
            if attempt == 2:
                return page_num, False, str(e)
            time.sleep(1)

    return page_num, False, "فشل غير معروف"

def main():
    print("=== بدء تنزيل صفحات مصحف المدينة النبوية (604 صفحة) ===")
    start_time = time.time()
    success = 0

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(download_page, p): p for p in range(1, 605)}
        for future in as_completed(futures):
            p, ok, msg = future.result()
            if ok:
                success += 1
                if success % 50 == 0 or success == 604:
                    print(f"[{success}/604] صفحة {p}: {msg}")
            else:
                print(f"[X] صفحة {p}: {msg}", file=sys.stderr)

    elapsed = time.time() - start_time
    print(f"\n✓ اكتمل تنزيل {success}/604 صفحة في {elapsed:.2f} ثانية.")

if __name__ == "__main__":
    main()
