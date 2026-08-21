export const isActiveHref = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

const routeLabels = [
  ["/dashboard", "แดชบอร์ด"],
  ["/documents", "เอกสารของฉัน"],
  ["/chat", "แชทกับเอกสาร"],
  ["/quiz", "ควิซทบทวน"],
  ["/analytics", "สถิติการทบทวน"],
  ["/settings", "การตั้งค่า"],
  ["/courses", "คอร์สเรียน"]
] as const;

export const getAppRouteLabel = (pathname: string) => {
  return routeLabels.find(([href]) => isActiveHref(pathname, href))?.[1] ?? "พื้นที่เรียน";
};
