const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'data', 'quran', 'svg');
fs.mkdirSync(targetDir, { recursive: true });

async function downloadAll() {
  console.log('Starting parallel download of 604 King Fahd Complex SVGs...');
  let downloaded = 0;
  let skipped = 0;
  const batchSize = 10;
  
  for (let i = 1; i <= 604; i += batchSize) {
    const promises = [];
    for (let j = i; j < Math.min(i + batchSize, 605); j++) {
      const pagePad = String(j).padStart(3, '0');
      const filePath = path.join(targetDir, `${pagePad}.svg`);
      if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
        skipped++;
        continue;
      }
      promises.push((async () => {
        try {
          const url = `https://cdn.quran.ws/svg/pages/v1.1.1/hafs-kfqc/${pagePad}.svg`;
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            fs.writeFileSync(filePath, text, 'utf8');
            downloaded++;
          } else {
            const fallback = `https://cdn.jsdelivr.net/gh/quran-ws/quran-svg@main/mushafs/hafs/kfqc/svg/${pagePad}.svg`;
            const fbRes = await fetch(fallback);
            if (fbRes.ok) {
              const fbText = await fbRes.text();
              fs.writeFileSync(filePath, fbText, 'utf8');
              downloaded++;
            }
          }
        } catch (e) {
          console.error(`Failed page ${pagePad}:`, e.message);
        }
      })());
    }
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    if (i % 50 === 1 || i + batchSize > 604) {
      console.log(`Progress: processed up to page ${Math.min(i + batchSize - 1, 604)} / 604 (new: ${downloaded}, existing: ${skipped})`);
    }
  }
  console.log(`Finished! Total downloaded: ${downloaded}, Existing: ${skipped}`);
}

downloadAll();
