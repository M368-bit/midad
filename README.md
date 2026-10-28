# منصة مِداد | MIDAD Platform

منصة إسلامية موثقة وشاملة للقرآن الكريم، الأحاديث النبوية، الدروس والمحاضرات، والكتب والمراجع.

## هيكل المشروع (Project Architecture):

```text
midad/
├── web/     # موقع الويب الكامل (Next.js 14 + Tailwind CSS + Supabase)
└── app/     # تطبيق الهاتف الذكي (iOS & Android) - سيتم تنفيذه بعد الموقع
```

## تشغيل موقع الويب محلياً:

```bash
cd web
npm run dev
```

للبناء والتشغيل الإنتاجي:
```bash
cd web
npm run build
npm run start
```
