import { describe, it, expect } from "vitest";
import {
  canAccessAdmin,
  canManageContent,
  canManageUsers,
  canDeleteCoreData,
  canPublishContent,
  getRoleLabelAr,
} from "./rbac";

describe("RBAC Permissions", () => {
  it("allows only admin and editor to access admin dashboard", () => {
    expect(canAccessAdmin("admin")).toBe(true);
    expect(canAccessAdmin("editor")).toBe(true);
    expect(canAccessAdmin("viewer")).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
    expect(canAccessAdmin(undefined)).toBe(false);
  });

  it("restricts user management and core data deletion strictly to admin", () => {
    expect(canManageUsers("admin")).toBe(true);
    expect(canManageUsers("editor")).toBe(false);
    expect(canManageUsers("viewer")).toBe(false);

    expect(canDeleteCoreData("admin")).toBe(true);
    expect(canDeleteCoreData("editor")).toBe(false);
  });

  it("allows admin and editor to publish verified content", () => {
    expect(canPublishContent("admin")).toBe(true);
    expect(canPublishContent("editor")).toBe(true);
    expect(canPublishContent("viewer")).toBe(false);
  });

  it("returns correct Arabic labels for roles", () => {
    expect(getRoleLabelAr("admin")).toBe("مدير المنصة");
    expect(getRoleLabelAr("editor")).toBe("محرر ومراجع موثق");
    expect(getRoleLabelAr("viewer")).toBe("مستخدم مسجل");
  });
});
