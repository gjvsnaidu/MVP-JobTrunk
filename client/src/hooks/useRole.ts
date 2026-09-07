import { useMe } from "@/lib/api";
import { ROLE_MENUS } from "@/lib/constants";

export function useRole() {
  const { data: user, isLoading } = useMe();

  const u = user as any;
  const role = u?.role ?? null;
  const menuItems = role ? ROLE_MENUS[role] ?? [] : [];

  const isStudent = role === "student";
  const isIndustry = role === "industry";
  const isAcademician = role === "academician";
  const isInstitution = role === "institution";
  const isAdmin = role === "admin";

  return {
    user: u,
    role,
    menuItems,
    isStudent,
    isIndustry,
    isAcademician,
    isInstitution,
    isAdmin,
    isLoading,
    isAuthenticated: Boolean(u),
  };
}
