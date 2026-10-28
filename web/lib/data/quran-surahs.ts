/**
 * فهرس سور القرآن الكريم المعتمد (114 سورة) مع كافة البيانات التوثيقية
 * بيانات مصحف المدينة النبوية - مجمع الملك فهد لطباعة المصحف الشريف
 */

export interface SurahMeta {
  number: number;
  name: string; // الاسم بالعربية مع التشكيل أو الرسم المعتاد
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
  revelationOrder: number;
  juz: number; // رقم الجزء الذي تبدأ منه السورة
  page: number; // رقم الصفحة في مصحف المدينة
}

export const QURAN_SURAHS: SurahMeta[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Faatiha", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan", revelationOrder: 5, juz: 1, page: 1 },
  { number: 2, name: "البقرة", englishName: "Al-Baqara", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan", revelationOrder: 87, juz: 1, page: 2 },
  { number: 3, name: "آل عمران", englishName: "Aal-i-Imraan", englishNameTranslation: "The Family of Imraan", numberOfAyahs: 200, revelationType: "Medinan", revelationOrder: 89, juz: 3, page: 50 },
  { number: 4, name: "النساء", englishName: "An-Nisaa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan", revelationOrder: 92, juz: 4, page: 77 },
  { number: 5, name: "المائدة", englishName: "Al-Maaida", englishNameTranslation: "The Table Spread", numberOfAyahs: 120, revelationType: "Medinan", revelationOrder: 112, juz: 6, page: 106 },
  { number: 6, name: "الأنعام", englishName: "Al-An'aam", englishNameTranslation: "The Cattle", numberOfAyahs: 165, revelationType: "Meccan", revelationOrder: 55, juz: 7, page: 128 },
  { number: 7, name: "الأعراف", englishName: "Al-A'raaf", englishNameTranslation: "The Heights", numberOfAyahs: 206, revelationType: "Meccan", revelationOrder: 39, juz: 8, page: 151 },
  { number: 8, name: "الأنفال", englishName: "Al-Anfaal", englishNameTranslation: "The Spoils of War", numberOfAyahs: 75, revelationType: "Medinan", revelationOrder: 88, juz: 9, page: 177 },
  { number: 9, name: "التوبة", englishName: "At-Tawba", englishNameTranslation: "The Repentance", numberOfAyahs: 129, revelationType: "Medinan", revelationOrder: 113, juz: 10, page: 187 },
  { number: 10, name: "يونس", englishName: "Yunus", englishNameTranslation: "Jonah", numberOfAyahs: 109, revelationType: "Meccan", revelationOrder: 51, juz: 11, page: 208 },
  { number: 11, name: "هود", englishName: "Hud", englishNameTranslation: "Hud", numberOfAyahs: 123, revelationType: "Meccan", revelationOrder: 52, juz: 11, page: 221 },
  { number: 12, name: "يوسف", englishName: "Yusuf", englishNameTranslation: "Joseph", numberOfAyahs: 111, revelationType: "Meccan", revelationOrder: 53, juz: 12, page: 235 },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", englishNameTranslation: "The Thunder", numberOfAyahs: 43, revelationType: "Medinan", revelationOrder: 96, juz: 13, page: 249 },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", englishNameTranslation: "Abraham", numberOfAyahs: 52, revelationType: "Meccan", revelationOrder: 72, juz: 13, page: 255 },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", englishNameTranslation: "The Rocky Tract", numberOfAyahs: 99, revelationType: "Meccan", revelationOrder: 54, juz: 14, page: 262 },
  { number: 16, name: "النحل", englishName: "An-Nahl", englishNameTranslation: "The Bee", numberOfAyahs: 128, revelationType: "Meccan", revelationOrder: 70, juz: 14, page: 267 },
  { number: 17, name: "الإسراء", englishName: "Al-Israa", englishNameTranslation: "The Night Journey", numberOfAyahs: 111, revelationType: "Meccan", revelationOrder: 50, juz: 15, page: 282 },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", englishNameTranslation: "The Cave", numberOfAyahs: 110, revelationType: "Meccan", revelationOrder: 69, juz: 15, page: 293 },
  { number: 19, name: "مريم", englishName: "Maryam", englishNameTranslation: "Mary", numberOfAyahs: 98, revelationType: "Meccan", revelationOrder: 44, juz: 16, page: 305 },
  { number: 20, name: "طه", englishName: "Taa-Haa", englishNameTranslation: "Taa-Haa", numberOfAyahs: 135, revelationType: "Meccan", revelationOrder: 45, juz: 16, page: 312 },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiyaa", englishNameTranslation: "The Prophets", numberOfAyahs: 112, revelationType: "Meccan", revelationOrder: 73, juz: 17, page: 322 },
  { number: 22, name: "الحج", englishName: "Al-Hajj", englishNameTranslation: "The Pilgrimage", numberOfAyahs: 78, revelationType: "Medinan", revelationOrder: 103, juz: 17, page: 332 },
  { number: 23, name: "المؤمنون", englishName: "Al-Muminoon", englishNameTranslation: "The Believers", numberOfAyahs: 118, revelationType: "Meccan", revelationOrder: 74, juz: 18, page: 342 },
  { number: 24, name: "النور", englishName: "An-Noor", englishNameTranslation: "The Light", numberOfAyahs: 64, revelationType: "Medinan", revelationOrder: 102, juz: 18, page: 350 },
  { number: 25, name: "الفرقان", englishName: "Al-Furqaan", englishNameTranslation: "The Criterion", numberOfAyahs: 77, revelationType: "Meccan", revelationOrder: 42, juz: 18, page: 359 },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'araa", englishNameTranslation: "The Poets", numberOfAyahs: 227, revelationType: "Meccan", revelationOrder: 47, juz: 19, page: 367 },
  { number: 27, name: "النمل", englishName: "An-Naml", englishNameTranslation: "The Ant", numberOfAyahs: 93, revelationType: "Meccan", revelationOrder: 48, juz: 19, page: 377 },
  { number: 28, name: "القصص", englishName: "Al-Qasas", englishNameTranslation: "The Stories", numberOfAyahs: 88, revelationType: "Meccan", revelationOrder: 49, juz: 20, page: 385 },
  { number: 29, name: "العنكبوت", englishName: "Al-Ankaboot", englishNameTranslation: "The Spider", numberOfAyahs: 69, revelationType: "Meccan", revelationOrder: 85, juz: 20, page: 396 },
  { number: 30, name: "الروم", englishName: "Ar-Room", englishNameTranslation: "The Romans", numberOfAyahs: 60, revelationType: "Meccan", revelationOrder: 84, juz: 21, page: 404 },
  { number: 31, name: "لقمان", englishName: "Luqman", englishNameTranslation: "Luqman", numberOfAyahs: 34, revelationType: "Meccan", revelationOrder: 57, juz: 21, page: 411 },
  { number: 32, name: "السجدة", englishName: "As-Sajda", englishNameTranslation: "The Prostration", numberOfAyahs: 30, revelationType: "Meccan", revelationOrder: 75, juz: 21, page: 415 },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzaab", englishNameTranslation: "The Combined Forces", numberOfAyahs: 73, revelationType: "Medinan", revelationOrder: 90, juz: 21, page: 418 },
  { number: 34, name: "سبأ", englishName: "Saba", englishNameTranslation: "Sheba", numberOfAyahs: 54, revelationType: "Meccan", revelationOrder: 58, juz: 22, page: 428 },
  { number: 35, name: "فاطر", englishName: "Faatir", englishNameTranslation: "The Originator", numberOfAyahs: 45, revelationType: "Meccan", revelationOrder: 43, juz: 22, page: 434 },
  { number: 36, name: "يس", englishName: "Yaseen", englishNameTranslation: "Yaseen", numberOfAyahs: 83, revelationType: "Meccan", revelationOrder: 41, juz: 22, page: 440 },
  { number: 37, name: "الصافات", englishName: "As-Saaffaat", englishNameTranslation: "Those who set the Ranks", numberOfAyahs: 182, revelationType: "Meccan", revelationOrder: 56, juz: 23, page: 446 },
  { number: 38, name: "ص", englishName: "Saad", englishNameTranslation: "The Letter Saad", numberOfAyahs: 88, revelationType: "Meccan", revelationOrder: 38, juz: 23, page: 453 },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", englishNameTranslation: "The Troops", numberOfAyahs: 75, revelationType: "Meccan", revelationOrder: 59, juz: 23, page: 458 },
  { number: 40, name: "غافر", englishName: "Ghafir", englishNameTranslation: "The Forgiver", numberOfAyahs: 85, revelationType: "Meccan", revelationOrder: 60, juz: 24, page: 467 },
  { number: 41, name: "فصلت", englishName: "Fussilat", englishNameTranslation: "Explained in Detail", numberOfAyahs: 54, revelationType: "Meccan", revelationOrder: 61, juz: 24, page: 477 },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", englishNameTranslation: "The Consultation", numberOfAyahs: 53, revelationType: "Meccan", revelationOrder: 62, juz: 25, page: 483 },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", englishNameTranslation: "The Ornaments of Gold", numberOfAyahs: 89, revelationType: "Meccan", revelationOrder: 63, juz: 25, page: 489 },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhaan", englishNameTranslation: "The Smoke", numberOfAyahs: 59, revelationType: "Meccan", revelationOrder: 64, juz: 25, page: 496 },
  { number: 45, name: "الجاثية", englishName: "Al-Jaathiya", englishNameTranslation: "The Crouching", numberOfAyahs: 37, revelationType: "Meccan", revelationOrder: 65, juz: 25, page: 499 },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaaf", englishNameTranslation: "The Wind-Curved Sandhills", numberOfAyahs: 35, revelationType: "Meccan", revelationOrder: 66, juz: 26, page: 502 },
  { number: 47, name: "محمد", englishName: "Muhammad", englishNameTranslation: "Muhammad", numberOfAyahs: 38, revelationType: "Medinan", revelationOrder: 95, juz: 26, page: 507 },
  { number: 48, name: "الفتح", englishName: "Al-Fath", englishNameTranslation: "The Victory", numberOfAyahs: 29, revelationType: "Medinan", revelationOrder: 111, juz: 26, page: 511 },
  { number: 49, name: "الحجرات", englishName: "Al-Hujuraat", englishNameTranslation: "The Rooms", numberOfAyahs: 18, revelationType: "Medinan", revelationOrder: 106, juz: 26, page: 515 },
  { number: 50, name: "ق", englishName: "Qaaf", englishNameTranslation: "The Letter Qaaf", numberOfAyahs: 45, revelationType: "Meccan", revelationOrder: 34, juz: 26, page: 518 },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhaariyat", englishNameTranslation: "The Winnowing Winds", numberOfAyahs: 60, revelationType: "Meccan", revelationOrder: 67, juz: 26, page: 520 },
  { number: 52, name: "الطور", englishName: "At-Toor", englishNameTranslation: "The Mount", numberOfAyahs: 49, revelationType: "Meccan", revelationOrder: 76, juz: 27, page: 523 },
  { number: 53, name: "النجم", englishName: "An-Najm", englishNameTranslation: "The Star", numberOfAyahs: 62, revelationType: "Meccan", revelationOrder: 23, juz: 27, page: 526 },
  { number: 54, name: "القمر", englishName: "Al-Qamar", englishNameTranslation: "The Moon", numberOfAyahs: 55, revelationType: "Meccan", revelationOrder: 37, juz: 27, page: 528 },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahmaan", englishNameTranslation: "The Beneficent", numberOfAyahs: 78, revelationType: "Medinan", revelationOrder: 97, juz: 27, page: 531 },
  { number: 56, name: "الواقعة", englishName: "Al-Waaqia", englishNameTranslation: "The Inevitable", numberOfAyahs: 96, revelationType: "Meccan", revelationOrder: 46, juz: 27, page: 534 },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", englishNameTranslation: "The Iron", numberOfAyahs: 29, revelationType: "Medinan", revelationOrder: 94, juz: 27, page: 537 },
  { number: 58, name: "المجادلة", englishName: "Al-Mujaadila", englishNameTranslation: "The Pleading Woman", numberOfAyahs: 22, revelationType: "Medinan", revelationOrder: 105, juz: 28, page: 542 },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", englishNameTranslation: "The Exile", numberOfAyahs: 24, revelationType: "Medinan", revelationOrder: 101, juz: 28, page: 545 },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahana", englishNameTranslation: "She that is to be examined", numberOfAyahs: 13, revelationType: "Medinan", revelationOrder: 91, juz: 28, page: 549 },
  { number: 61, name: "الصف", englishName: "As-Saff", englishNameTranslation: "The Ranks", numberOfAyahs: 14, revelationType: "Medinan", revelationOrder: 109, juz: 28, page: 551 },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'a", englishNameTranslation: "The Congregation", numberOfAyahs: 11, revelationType: "Medinan", revelationOrder: 110, juz: 28, page: 553 },
  { number: 63, name: "المنافقون", englishName: "Al-Munaafiqoon", englishNameTranslation: "The Hypocrites", numberOfAyahs: 11, revelationType: "Medinan", revelationOrder: 104, juz: 28, page: 554 },
  { number: 64, name: "التغابن", englishName: "At-Taghaabun", englishNameTranslation: "The Mutual Disillusion", numberOfAyahs: 18, revelationType: "Medinan", revelationOrder: 108, juz: 28, page: 556 },
  { number: 65, name: "الطلاق", englishName: "At-Talaaq", englishNameTranslation: "The Divorce", numberOfAyahs: 12, revelationType: "Medinan", revelationOrder: 99, juz: 28, page: 558 },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", englishNameTranslation: "The Prohibition", numberOfAyahs: 12, revelationType: "Medinan", revelationOrder: 107, juz: 28, page: 560 },
  { number: 67, name: "الملك", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", numberOfAyahs: 30, revelationType: "Meccan", revelationOrder: 77, juz: 29, page: 562 },
  { number: 68, name: "القلم", englishName: "Al-Qalam", englishNameTranslation: "The Pen", numberOfAyahs: 52, revelationType: "Meccan", revelationOrder: 2, juz: 29, page: 564 },
  { number: 69, name: "الحاقة", englishName: "Al-Haaqqa", englishNameTranslation: "The Reality", numberOfAyahs: 52, revelationType: "Meccan", revelationOrder: 78, juz: 29, page: 566 },
  { number: 70, name: "المعارج", englishName: "Al-Ma'aarij", englishNameTranslation: "The Ascending Stairways", numberOfAyahs: 44, revelationType: "Meccan", revelationOrder: 79, juz: 29, page: 568 },
  { number: 71, name: "نوح", englishName: "Nooh", englishNameTranslation: "Noah", numberOfAyahs: 28, revelationType: "Meccan", revelationOrder: 71, juz: 29, page: 570 },
  { number: 72, name: "الجن", englishName: "Al-Jinn", englishNameTranslation: "The Jinn", numberOfAyahs: 28, revelationType: "Meccan", revelationOrder: 40, juz: 29, page: 572 },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", englishNameTranslation: "The Enshrouded One", numberOfAyahs: 20, revelationType: "Meccan", revelationOrder: 3, juz: 29, page: 574 },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", englishNameTranslation: "The Cloaked One", numberOfAyahs: 56, revelationType: "Meccan", revelationOrder: 4, juz: 29, page: 575 },
  { number: 75, name: "القيامة", englishName: "Al-Qiyaama", englishNameTranslation: "The Resurrection", numberOfAyahs: 40, revelationType: "Meccan", revelationOrder: 31, juz: 29, page: 577 },
  { number: 76, name: "الإنسان", englishName: "Al-Insaan", englishNameTranslation: "The Man", numberOfAyahs: 31, revelationType: "Medinan", revelationOrder: 98, juz: 29, page: 578 },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalaat", englishNameTranslation: "The Emissaries", numberOfAyahs: 50, revelationType: "Meccan", revelationOrder: 33, juz: 29, page: 580 },
  { number: 78, name: "النبأ", englishName: "An-Naba", englishNameTranslation: "The Tidings", numberOfAyahs: 40, revelationType: "Meccan", revelationOrder: 80, juz: 30, page: 582 },
  { number: 79, name: "النازعات", englishName: "An-Naazi'aat", englishNameTranslation: "Those who drag forth", numberOfAyahs: 46, revelationType: "Meccan", revelationOrder: 81, juz: 30, page: 583 },
  { number: 80, name: "عبس", englishName: "Abasa", englishNameTranslation: "He Frowned", numberOfAyahs: 42, revelationType: "Meccan", revelationOrder: 24, juz: 30, page: 585 },
  { number: 81, name: "التكوير", englishName: "At-Takwir", englishNameTranslation: "The Overthrowing", numberOfAyahs: 29, revelationType: "Meccan", revelationOrder: 7, juz: 30, page: 586 },
  { number: 82, name: "الانفطار", englishName: "Al-Infitaar", englishNameTranslation: "The Cleaving", numberOfAyahs: 19, revelationType: "Meccan", revelationOrder: 82, juz: 30, page: 587 },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", englishNameTranslation: "The Defrauding", numberOfAyahs: 36, revelationType: "Meccan", revelationOrder: 86, juz: 30, page: 587 },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaaq", englishNameTranslation: "The Sundering", numberOfAyahs: 25, revelationType: "Meccan", revelationOrder: 83, juz: 30, page: 589 },
  { number: 85, name: "البروج", englishName: "Al-Burooj", englishNameTranslation: "The Mansions of the Stars", numberOfAyahs: 22, revelationType: "Meccan", revelationOrder: 27, juz: 30, page: 590 },
  { number: 86, name: "الطارق", englishName: "At-Taariq", englishNameTranslation: "The Nightcomer", numberOfAyahs: 17, revelationType: "Meccan", revelationOrder: 36, juz: 30, page: 591 },
  { number: 87, name: "الأعلى", englishName: "Al-A'laa", englishNameTranslation: "The Most High", numberOfAyahs: 19, revelationType: "Meccan", revelationOrder: 8, juz: 30, page: 591 },
  { number: 88, name: "الغاشية", englishName: "Al-Ghaashiya", englishNameTranslation: "The Overwhelming", numberOfAyahs: 26, revelationType: "Meccan", revelationOrder: 68, juz: 30, page: 592 },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", englishNameTranslation: "The Dawn", numberOfAyahs: 30, revelationType: "Meccan", revelationOrder: 10, juz: 30, page: 593 },
  { number: 90, name: "البلد", englishName: "Al-Balad", englishNameTranslation: "The City", numberOfAyahs: 20, revelationType: "Meccan", revelationOrder: 35, juz: 30, page: 594 },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", englishNameTranslation: "The Sun", numberOfAyahs: 15, revelationType: "Meccan", revelationOrder: 26, juz: 30, page: 595 },
  { number: 92, name: "الليل", englishName: "Al-Lail", englishNameTranslation: "The Night", numberOfAyahs: 21, revelationType: "Meccan", revelationOrder: 9, juz: 30, page: 595 },
  { number: 93, name: "الضحى", englishName: "Ad-Dhuhaa", englishNameTranslation: "The Morning Hours", numberOfAyahs: 11, revelationType: "Meccan", revelationOrder: 11, juz: 30, page: 596 },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", englishNameTranslation: "The Relief", numberOfAyahs: 8, revelationType: "Meccan", revelationOrder: 12, juz: 30, page: 596 },
  { number: 95, name: "التين", englishName: "At-Teen", englishNameTranslation: "The Fig", numberOfAyahs: 8, revelationType: "Meccan", revelationOrder: 28, juz: 30, page: 597 },
  { number: 96, name: "العلق", englishName: "Al-Alaq", englishNameTranslation: "The Clot", numberOfAyahs: 19, revelationType: "Meccan", revelationOrder: 1, juz: 30, page: 597 },
  { number: 97, name: "القدر", englishName: "Al-Qadr", englishNameTranslation: "The Power", numberOfAyahs: 5, revelationType: "Meccan", revelationOrder: 25, juz: 30, page: 598 },
  { number: 98, name: "البينة", englishName: "Al-Bayyina", englishNameTranslation: "The Clear Proof", numberOfAyahs: 8, revelationType: "Medinan", revelationOrder: 100, juz: 30, page: 598 },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzala", englishNameTranslation: "The Earthquake", numberOfAyahs: 8, revelationType: "Medinan", revelationOrder: 93, juz: 30, page: 599 },
  { number: 100, name: "العاديات", englishName: "Al-Aadiyaat", englishNameTranslation: "The Courser", numberOfAyahs: 11, revelationType: "Meccan", revelationOrder: 14, juz: 30, page: 599 },
  { number: 101, name: "القارعة", englishName: "Al-Qaari'a", englishNameTranslation: "The Calamity", numberOfAyahs: 11, revelationType: "Meccan", revelationOrder: 30, juz: 30, page: 600 },
  { number: 102, name: "التكاثر", englishName: "At-Takaathur", englishNameTranslation: "The Rivalry in World Increase", numberOfAyahs: 8, revelationType: "Meccan", revelationOrder: 16, juz: 30, page: 600 },
  { number: 103, name: "العصر", englishName: "Al-Asr", englishNameTranslation: "The Declining Day", numberOfAyahs: 3, revelationType: "Meccan", revelationOrder: 13, juz: 30, page: 601 },
  { number: 104, name: "الهمزة", englishName: "Al-Humaza", englishNameTranslation: "The Traducer", numberOfAyahs: 9, revelationType: "Meccan", revelationOrder: 32, juz: 30, page: 601 },
  { number: 105, name: "الفيل", englishName: "Al-Feel", englishNameTranslation: "The Elephant", numberOfAyahs: 5, revelationType: "Meccan", revelationOrder: 19, juz: 30, page: 601 },
  { number: 106, name: "قريش", englishName: "Quraish", englishNameTranslation: "Quraysh", numberOfAyahs: 4, revelationType: "Meccan", revelationOrder: 29, juz: 30, page: 602 },
  { number: 107, name: "الماعون", englishName: "Al-Maa'oon", englishNameTranslation: "The Small Kindnesses", numberOfAyahs: 7, revelationType: "Meccan", revelationOrder: 17, juz: 30, page: 602 },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", englishNameTranslation: "The Abundance", numberOfAyahs: 3, revelationType: "Meccan", revelationOrder: 15, juz: 30, page: 602 },
  { number: 109, name: "الكافرون", englishName: "Al-Kaafiroon", englishNameTranslation: "The Disbelievers", numberOfAyahs: 6, revelationType: "Meccan", revelationOrder: 18, juz: 30, page: 603 },
  { number: 110, name: "النصر", englishName: "An-Nasr", englishNameTranslation: "The Divine Support", numberOfAyahs: 3, revelationType: "Medinan", revelationOrder: 114, juz: 30, page: 603 },
  { number: 111, name: "المسد", englishName: "Al-Masad", englishNameTranslation: "The Palm Fiber", numberOfAyahs: 5, revelationType: "Meccan", revelationOrder: 6, juz: 30, page: 603 },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlaas", englishNameTranslation: "The Sincerity", numberOfAyahs: 4, revelationType: "Meccan", revelationOrder: 22, juz: 30, page: 604 },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", englishNameTranslation: "The Daybreak", numberOfAyahs: 5, revelationType: "Meccan", revelationOrder: 20, juz: 30, page: 604 },
  { number: 114, name: "الناس", englishName: "An-Naas", englishNameTranslation: "Mankind", numberOfAyahs: 6, revelationType: "Meccan", revelationOrder: 21, juz: 30, page: 604 },
];

export function getSurahByNumber(num: number): SurahMeta | undefined {
  return QURAN_SURAHS.find((s) => s.number === num);
}

export function searchSurahs(query: string): SurahMeta[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return QURAN_SURAHS;
  return QURAN_SURAHS.filter(
    (s) =>
      s.name.includes(clean) ||
      s.englishName.toLowerCase().includes(clean) ||
      String(s.number) === clean
  );
}
