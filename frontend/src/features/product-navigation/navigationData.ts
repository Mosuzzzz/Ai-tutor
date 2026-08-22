import type { AuthRouteRole } from "../auth/types";

export const marketingNavigation = [
  { href: "#how-it-works", labels: { en: "How it works", th: "วิธีการทำงาน" } },
  { href: "#study-kit", labels: { en: "Study kit", th: "ชุดเครื่องมือเรียน" } },
  { href: "#progress", labels: { en: "Progress", th: "ความก้าวหน้า" } },
  { href: "#faq", labels: { en: "FAQ", th: "คำถามที่พบบ่อย" } }
] as const;

const allRoles: readonly AuthRouteRole[] = ["user", "admin"];
export const productNavigation = [
  { allowedRoles: allRoles, href: "/dashboard", labels: { en: "Dashboard", th: "แดชบอร์ด" } },
  { allowedRoles: allRoles, href: "/documents", labels: { en: "Documents", th: "เอกสารของฉัน" } },
  { allowedRoles: allRoles, href: "/chat", labels: { en: "Chat", th: "แชทกับเอกสาร" } },
  { allowedRoles: allRoles, href: "/quiz", labels: { en: "Quiz", th: "ควิซทบทวน" } },
  { allowedRoles: allRoles, href: "/analytics", labels: { en: "Analytics", th: "สถิติการทบทวน" } }
] as const;

export const getProductNavigation = (role: AuthRouteRole) =>
  productNavigation.filter((item) => item.allowedRoles.includes(role));
