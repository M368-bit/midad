import { UserRole } from "@/types";

/**
 * فحص صلاحية الوصول إلى لوحة الإدارة
 */
export function canAccessAdmin(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === "admin" || role === "editor";
}

/**
 * فحص صلاحية تعديل وإنشاء المحتوى
 */
export function canManageContent(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === "admin" || role === "editor";
}

/**
 * فحص صلاحية نشر المحتوى والاعتماد النهائي
 */
export function canPublishContent(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === "admin" || role === "editor";
}

/**
 * فحص صلاحية إدارة المستخدمين وتعيين الأدوار (المدير فقط)
 */
export function canManageUsers(role?: UserRole | null): boolean {
  return role === "admin";
}

/**
 * فحص صلاحية حذف السجلات الأساسية أو الإشراف على التدقيق (المدير فقط)
 */
export function canDeleteCoreData(role?: UserRole | null): boolean {
  return role === "admin";
}

/**
 * ترجمة مسمى الدور باللغة العربية
 */
export function getRoleLabelAr(role: UserRole): string {
  switch (role) {
    case "admin":
      return "مدير المنصة";
    case "editor":
      return "محرر ومراجع موثق";
    case "viewer":
    default:
      return "مستخدم مسجل";
  }
}
