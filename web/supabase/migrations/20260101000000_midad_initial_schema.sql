-- ====================================================================
-- مشروع مداد | MIDAD — مخطط قاعدة البيانات الأساسي (Migration v1)
-- ====================================================================

-- 1. تفعيل الإضافات الضرورية (Extensions)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. دوال مساعدة لإدارة التوقيت والتحديث التلقائي
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 3. الأدوار والمستخدمين (Roles & Profiles)
-- ====================================================================

-- جدول الأدوار (Roles)
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.roles (id, name_ar, description)
VALUES 
    ('admin', 'مدير النظام', 'صلاحيات كاملة لإدارة المنصة والمستخدمين ونشر المحتوى'),
    ('editor', 'محرر ومراجع', 'صلاحية إضافة ومراجعة المحتوى والتحقق من المصادر دون حذف النظام'),
    ('viewer', 'مستخدم مسجل', 'مستخدم عادي يملك حق المفضلة، وسجل التصفح، والملف الشخصي')
ON CONFLICT (id) DO NOTHING;

-- جدول الملفات الشخصية (Profiles) - مرتبط بـ auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role_id TEXT NOT NULL DEFAULT 'viewer' REFERENCES public.roles(id) ON DELETE RESTRICT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة أمان للتحقق من صلاحية الإدارة (Server-side Role Check Helper)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role_id = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة أمان للتحقق من صلاحية التحرير أو الإدارة
CREATE OR REPLACE FUNCTION public.is_editor_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role_id IN ('admin', 'editor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة تلقائية لإنشاء ملف شخصي عند تسجيل مستخدم جديد في Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'viewer' -- يُمنع منح صلاحيات إدارية تلقائياً لأي مستخدم جديد
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger على auth.users (يُفعل في Supabase)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 4. التصنيفات والموضوعات (Categories)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    icon TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ====================================================================
-- 5. العلماء والدعاة ومصادرهم (Scholars & Sources)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.scholars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    title TEXT, -- مثال: الإمام، العلامة، الشيخ، الحافظ
    era TEXT, -- مثال: العصر العباسي، المتقدمون، المعاصرون
    is_contemporary BOOLEAN DEFAULT FALSE,
    birth_year INT, -- بالهجري
    death_year INT, -- بالهجري (null إذا كان معاصراً حياً)
    bio TEXT NOT NULL,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'published', 'archived')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scholars_slug ON public.scholars(slug);
CREATE INDEX IF NOT EXISTS idx_scholars_status ON public.scholars(status);
CREATE INDEX IF NOT EXISTS idx_scholars_name_trgm ON public.scholars USING gin (name gin_trgm_ops);

CREATE TRIGGER update_scholars_updated_at
BEFORE UPDATE ON public.scholars
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- مصادر توثيق ترجمة العالم
CREATE TABLE IF NOT EXISTS public.scholar_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scholar_id UUID NOT NULL REFERENCES public.scholars(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- اسم المرجع المعتمد، كـ: سير أعلام النبلاء للذهبي
    url TEXT,
    verifier_notes TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scholar_sources_scholar ON public.scholar_sources(scholar_id);

-- ====================================================================
-- 6. الدروس والمحاضرات ومصادرها (Lessons & Sources)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    scholar_id UUID REFERENCES public.scholars(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    media_url TEXT, -- رابط وسائط صالح وقابل للتحقق
    media_type TEXT CHECK (media_type IN ('audio', 'video', 'text')),
    duration_minutes INT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'published', 'archived')),
    published_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_slug ON public.lessons(slug);
CREATE INDEX IF NOT EXISTS idx_lessons_scholar ON public.lessons(scholar_id);
CREATE INDEX IF NOT EXISTS idx_lessons_category ON public.lessons(category_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON public.lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_title_trgm ON public.lessons USING gin (title gin_trgm_ops);

CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- مصادر توثيق الدرس الأصلي
CREATE TABLE IF NOT EXISTS public.lesson_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    original_url TEXT NOT NULL,
    publisher TEXT, -- مثال: موقع الشيخ الرسمي، إذاعة القرآن الكريم
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_sources_lesson ON public.lesson_sources(lesson_id);

-- ====================================================================
-- 7. المكتبة الإسلامية والكتب ومصادرها (Books & Sources)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    scholar_id UUID REFERENCES public.scholars(id) ON DELETE SET NULL, -- المؤلف
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    publication_year INT,
    pages_count INT,
    volumes_count INT DEFAULT 1,
    cover_image TEXT,
    read_url TEXT,
    download_url TEXT,
    usage_rights TEXT NOT NULL DEFAULT 'public_domain', -- حقوق الاستخدام (نطاق عام، وقف لله تعالى، بإذن الناشر)
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_books_slug ON public.books(slug);
CREATE INDEX IF NOT EXISTS idx_books_scholar ON public.books(scholar_id);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON public.books USING gin (title gin_trgm_ops);

CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- مصادر توثيق الكتاب
CREATE TABLE IF NOT EXISTS public.book_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL, -- مثال: المكتبة الشاملة، دار التأصيل، مكتبة الملك فهد الوطنية
    source_url TEXT NOT NULL,
    license_type TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_book_sources_book ON public.book_sources(book_id);

-- ====================================================================
-- 8. الحديث الشريف ومصادره وتخريجه (Hadith Collections & Hadiths)
-- ====================================================================

-- مجموعات الأحاديث الرئيسية (صحيح البخاري، صحيح مسلم، إلخ)
CREATE TABLE IF NOT EXISTS public.hadith_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    scholar_id UUID REFERENCES public.scholars(id) ON DELETE SET NULL,
    total_hadiths INT DEFAULT 0,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hadith_collections_slug ON public.hadith_collections(slug);

-- الكتب والأبواب داخل المجموعة (مثال: كتاب بدء الوحي، كتاب الإيمان)
CREATE TABLE IF NOT EXISTS public.hadith_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES public.hadith_collections(id) ON DELETE CASCADE,
    book_number INT NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (collection_id, book_number)
);

CREATE INDEX IF NOT EXISTS idx_hadith_books_coll ON public.hadith_books(collection_id);

-- نص الحديث النبوي الشريف
CREATE TABLE IF NOT EXISTS public.hadiths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES public.hadith_collections(id) ON DELETE RESTRICT,
    book_id UUID REFERENCES public.hadith_books(id) ON DELETE SET NULL,
    hadith_number INT NOT NULL,
    arabic_text TEXT NOT NULL,
    arabic_normalized TEXT, -- نص بدون تشكيل للبحث الدقيق
    english_text TEXT,
    narrator TEXT, -- الراوي الأعلى (صحابي الحديث)
    grade TEXT NOT NULL DEFAULT 'صحيح', -- درجة الصحة
    grade_source TEXT, -- توثيق مصدر الحكم بالصحة (مثال: أخرجه الشيخان في صحيحيهما)
    takhrij TEXT NOT NULL, -- التخريج المعتمد
    explanation TEXT, -- الشرح الميسر الموثق
    explanation_source TEXT, -- مرجع الشرح المعتمد (مثال: فتح الباري لابن حجر)
    chapter_title TEXT, -- اسم الباب الفقهي
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'in_review', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (collection_id, hadith_number)
);

CREATE INDEX IF NOT EXISTS idx_hadiths_collection ON public.hadiths(collection_id);
CREATE INDEX IF NOT EXISTS idx_hadiths_number ON public.hadiths(hadith_number);
CREATE INDEX IF NOT EXISTS idx_hadiths_status ON public.hadiths(status);
CREATE INDEX IF NOT EXISTS idx_hadiths_narrator ON public.hadiths(narrator);
CREATE INDEX IF NOT EXISTS idx_hadiths_text_trgm ON public.hadiths USING gin (arabic_normalized gin_trgm_ops);

CREATE TRIGGER update_hadiths_updated_at
BEFORE UPDATE ON public.hadiths
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- مصادر توثيق الحديث الشريف
CREATE TABLE IF NOT EXISTS public.hadith_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hadith_id UUID NOT NULL REFERENCES public.hadiths(id) ON DELETE CASCADE,
    reference_book TEXT NOT NULL,
    volume INT,
    page INT,
    hadith_number_in_source TEXT,
    verified_url TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hadith_sources_hadith ON public.hadith_sources(hadith_id);

-- ====================================================================
-- 9. ربط التصنيفات بالمحتوى (Content Categories)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.content_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type TEXT NOT NULL CHECK (content_type IN ('scholar', 'lesson', 'book', 'hadith')),
    content_id TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (content_type, content_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_content_cat_lookup ON public.content_categories(content_type, content_id);

-- ====================================================================
-- 10. تفاعلات المستخدم (المفضلة وسجل التصفح)
-- ====================================================================

-- المفضلة (Favorites)
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('scholar', 'lesson', 'book', 'hadith')),
    content_id TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

-- سجل نشاط المستخدم (User Activity History)
CREATE TABLE IF NOT EXISTS public.user_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('scholar', 'lesson', 'book', 'hadith')),
    content_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT,
    progress_seconds INT DEFAULT 0,
    last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_history_user ON public.user_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_last_viewed ON public.user_history(last_viewed_at DESC);

-- ====================================================================
-- 11. سجل التدقيق الإداري (Audit Logs)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'VERIFY', 'PUBLISH'
    entity_type TEXT NOT NULL, -- 'scholar', 'lesson', 'book', 'hadith', 'source'
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- ====================================================================
-- 12. تفعيل سياسات الأمان (Row Level Security - RLS)
-- ====================================================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholar_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadith_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadith_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadiths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadith_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- سياسات الأدوار (Roles)
-- --------------------------------------------------------------------
CREATE POLICY "الجميع يمكنهم قراءة الأدوار المتاحة"
    ON public.roles FOR SELECT
    USING (true);

-- --------------------------------------------------------------------
-- سياسات الملفات الشخصية (Profiles)
-- --------------------------------------------------------------------
-- المستخدم يمكنه قراءة ملفه وملفات الآخرين العامة
CREATE POLICY "المستخدمون يقرؤون الملفات الشخصية"
    ON public.profiles FOR SELECT
    USING (true);

-- المستخدم يعدل فقط ملفه الشخصي ولا يمكنه ترقية دوره بنفسه (role_id محفوظ)
CREATE POLICY "المستخدم يعدل ملفه الشخصي فقط"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        role_id = (SELECT role_id FROM public.profiles WHERE id = auth.uid()) -- يمنع ترقية الدور
    );

-- المدير فقط يمكنه تغيير أدوار المستخدمين
CREATE POLICY "المدير يملك حق تعديل أي ملف شخصي والدور"
    ON public.profiles FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- --------------------------------------------------------------------
-- سياسات المحتوى العام (Scholars, Lessons, Books, Hadiths, Categories)
-- --------------------------------------------------------------------

-- Categories
CREATE POLICY "الجميع يمكنهم قراءة التصنيفات"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "المشرفون يديرون التصنيفات"
    ON public.categories FOR ALL
    USING (public.is_editor_or_admin(auth.uid()));

-- Scholars
CREATE POLICY "الجميع يقرأ العلماء المنشورين"
    ON public.scholars FOR SELECT
    USING (status = 'published' OR public.is_editor_or_admin(auth.uid()));

CREATE POLICY "المشرفون يديرون بيانات العلماء"
    ON public.scholars FOR ALL
    USING (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "الجميع يقرأ مصادر العلماء المعتمدة"
    ON public.scholar_sources FOR SELECT
    USING (true);

CREATE POLICY "المشرفون يديرون مصادر العلماء"
    ON public.scholar_sources FOR ALL
    USING (public.is_editor_or_admin(auth.uid()));

-- Lessons
CREATE POLICY "الجميع يقرأ الدروس المنشورة"
    ON public.lessons FOR SELECT
    USING (status = 'published' OR public.is_editor_or_admin(auth.uid()));

CREATE POLICY "المشرفون يديرون الدروس"
    ON public.lessons FOR ALL
    USING (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "الجميع يقرأ مصادر الدروس"
    ON public.lesson_sources FOR SELECT
    USING (true);

CREATE POLICY "المشرفون يديرون مصادر الدروس"
    ON public.lesson_sources FOR ALL
    USING (public.is_editor_or_admin(auth.uid()));

-- Books
CREATE POLICY "الجميع يقرأ الكتب المنشورة"
    ON public.books FOR SELECT
    USING (status = 'published' OR public.is_editor_or_admin(auth.uid()));

CREATE POLICY "المشرفون يديرون الكتب"
    ON public.books FOR ALL
    USING (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "الجميع يقرأ مصادر الكتب"
    ON public.book_sources FOR SELECT
    USING (true);

CREATE POLICY "المشرفون يديرون مصادر الكتب"
    ON public.book_sources FOR ALL
    USING (public.is_editor_or_admin(auth.uid()));

-- Hadiths
CREATE POLICY "الجميع يقرأ المجموعات الحديثية"
    ON public.hadith_collections FOR SELECT
    USING (true);

CREATE POLICY "المشرفون يديرون المجموعات الحديثية"
    ON public.hadith_collections FOR ALL
    USING (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "الجميع يقرأ كتب الأحاديث"
    ON public.hadith_books FOR SELECT
    USING (true);

CREATE POLICY "المشرفون يديرون كتب الأحاديث"
    ON public.hadith_books FOR ALL
    USING (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "الجميع يقرأ الأحاديث المنشورة"
    ON public.hadiths FOR SELECT
    USING (status = 'published' OR public.is_editor_or_admin(auth.uid()));

CREATE POLICY "المشرفون يديرون الأحاديث"
    ON public.hadiths FOR ALL
    USING (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "الجميع يقرأ مصادر وتخريج الأحاديث"
    ON public.hadith_sources FOR SELECT
    USING (true);

CREATE POLICY "المشرفون يديرون مصادر الأحاديث"
    ON public.hadith_sources FOR ALL
    USING (public.is_editor_or_admin(auth.uid()));

-- Content Categories
CREATE POLICY "الجميع يقرأ تصنيفات المحتوى"
    ON public.content_categories FOR SELECT
    USING (true);

CREATE POLICY "المشرفون يديرون تصنيفات المحتوى"
    ON public.content_categories FOR ALL
    USING (public.is_editor_or_admin(auth.uid()));

-- --------------------------------------------------------------------
-- سياسات المفضلة وسجل النشاط (حماية صارمة للمستخدم)
-- --------------------------------------------------------------------

-- Favorites: يقرأ ويعدل فقط بياناته الخاصة
CREATE POLICY "المستخدم يرى مفضلته فقط"
    ON public.favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "المستخدم يضيف إلى مفضلته فقط"
    ON public.favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "المستخدم يحذف من مفضلته فقط"
    ON public.favorites FOR DELETE
    USING (auth.uid() = user_id);

-- User History: يقرأ ويعدل فقط سجله الخاص
CREATE POLICY "المستخدم يرى سجله فقط"
    ON public.user_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "المستخدم يسجل نشاطه فقط"
    ON public.user_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "المستخدم يحدّث نشاطه فقط"
    ON public.user_history FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "المستخدم يمسح سجله فقط"
    ON public.user_history FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- سياسات سجل التدقيق (Audit Logs)
-- --------------------------------------------------------------------
-- المدير فقط يستعرض السجلات الإدارية
CREATE POLICY "المدير فقط يستعرض سجلات التدقيق"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin(auth.uid()));

-- المحررون والمديرون يضيفون سجلات تدقيق
CREATE POLICY "المحررون يسجلون العمليات الإدارية"
    ON public.audit_logs FOR INSERT
    WITH CHECK (public.is_editor_or_admin(auth.uid()));
