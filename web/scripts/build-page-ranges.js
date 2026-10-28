const fs = require('fs');
const path = require('path');

const pageRanges = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'quran', 'page-ranges.json'), 'utf8'));

const tsContent = `// Auto-generated 604-page mapping for official Madinah Mushaf
export interface QuranPageRange {
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

export const QURAN_PAGE_RANGES: Record<number, QuranPageRange> = ${JSON.stringify(pageRanges, null, 2)};

export function getPageForAyah(surahNum: number, ayahNum: number): number {
  for (let p = 1; p <= 604; p++) {
    const r = QURAN_PAGE_RANGES[p];
    if (!r) continue;
    if (surahNum >= r.startSurah && surahNum <= r.endSurah) {
      if (r.startSurah === r.endSurah) {
        if (ayahNum >= r.startAyah && ayahNum <= r.endAyah) return p;
      } else {
        if (surahNum === r.startSurah && ayahNum >= r.startAyah) return p;
        if (surahNum === r.endSurah && ayahNum <= r.endAyah) return p;
        if (surahNum > r.startSurah && surahNum < r.endSurah) return p;
      }
    }
  }
  return 1;
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'lib', 'data', 'quran-page-ranges.ts'), tsContent, 'utf8');
console.log('Successfully wrote lib/data/quran-page-ranges.ts');
