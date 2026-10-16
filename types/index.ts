export type UserRole = "admin" | "editor" | "viewer";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role_id: UserRole;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentStatus = "draft" | "in_review" | "published" | "archived";

export interface ScholarSource {
  id: string;
  scholar_id: string;
  title: string;
  url?: string | null;
  verifier_notes?: string | null;
  is_verified: boolean;
  verified_at?: string | null;
}

export interface Scholar {
  id: string;
  slug: string;
  name: string;
  title?: string | null;
  era?: string | null;
  is_contemporary: boolean;
  birth_year?: number | null; // هجري
  death_year?: number | null; // هجري
  bio: string;
  avatar_url?: string | null;
  status: ContentStatus;
  verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  sources?: ScholarSource[];
  lessons_count?: number;
  books_count?: number;
}

export interface Category {
  id: string;
  slug: string;
  name_ar: string;
  name_en?: string | null;
  description?: string | null;
  icon?: string | null;
  sort_order?: number;
}

export type MediaType = "audio" | "video" | "text";

export interface LessonSource {
  id: string;
  lesson_id: string;
  title: string;
  original_url: string;
  publisher?: string | null;
  is_verified: boolean;
  verified_at?: string | null;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  scholar_id?: string | null;
  scholar?: Scholar | null;
  category_id?: string | null;
  category?: Category | null;
  description?: string | null;
  media_url?: string | null;
  media_type: MediaType;
  duration_minutes?: number | null;
  status: ContentStatus;
  published_date?: string | null;
  created_at?: string;
  updated_at?: string;
  sources?: LessonSource[];
}

export type BookUsageRights = "public_domain" | "waqf" | "publisher_permission";

export interface BookSource {
  id: string;
  book_id: string;
  source_name: string;
  source_url: string;
  license_type?: string | null;
  is_verified: boolean;
  verified_at?: string | null;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  scholar_id?: string | null;
  author?: Scholar | null;
  category_id?: string | null;
  category?: Category | null;
  description?: string | null;
  publication_year?: number | null;
  pages_count?: number | null;
  volumes_count?: number;
  cover_image?: string | null;
  read_url?: string | null;
  download_url?: string | null;
  usage_rights: BookUsageRights;
  status: ContentStatus;
  created_at?: string;
  updated_at?: string;
  sources?: BookSource[];
}

export interface HadithCollection {
  id: string;
  slug: string;
  name_ar: string;
  name_en?: string | null;
  scholar_id?: string | null;
  total_hadiths: number;
  description?: string | null;
  sort_order?: number;
}

export interface HadithBook {
  id: string;
  collection_id: string;
  book_number: number;
  name_ar: string;
  name_en?: string | null;
}

export interface HadithSource {
  id: string;
  hadith_id: string;
  reference_book: string;
  volume?: number | null;
  page?: number | null;
  hadith_number_in_source?: string | null;
  verified_url?: string | null;
  is_verified: boolean;
  verified_at?: string | null;
}

export interface Hadith {
  id: string;
  collection_id: string;
  collection?: HadithCollection | null;
  book_id?: string | null;
  book?: HadithBook | null;
  hadith_number: number;
  arabic_text: string;
  arabic_normalized?: string;
  english_text?: string | null;
  narrator?: string | null;
  grade: string;
  takhrij: string;
  explanation?: string | null;
  chapter_title?: string | null;
  status: ContentStatus;
  created_at?: string;
  sources?: HadithSource[];
}

export type ContentType = "scholar" | "lesson" | "book" | "hadith";

export interface Favorite {
  id: string;
  user_id: string;
  content_type: ContentType;
  content_id: string;
  created_at: string;
  title?: string;
  subtitle?: string;
  url?: string;
}

export interface UserHistoryItem {
  id: string;
  user_id: string;
  content_type: ContentType;
  content_id: string;
  title: string;
  progress_seconds: number;
  last_viewed_at: string;
  url?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "VERIFY" | "PUBLISH" | "ARCHIVE";
  entity_type: "scholar" | "lesson" | "book" | "hadith" | "source" | "user";
  entity_id?: string | null;
  details?: Record<string, unknown>;
  ip_address?: string | null;
  created_at: string;
}

export interface SearchFacetItem {
  type: ContentType;
  id: string;
  title: string;
  subtitle?: string;
  snippet?: string;
  url: string;
  badge?: string;
  is_verified: boolean;
}

export interface SearchResults {
  query: string;
  total: number;
  results: SearchFacetItem[];
  scholarsCount: number;
  lessonsCount: number;
  booksCount: number;
  hadithsCount: number;
}
