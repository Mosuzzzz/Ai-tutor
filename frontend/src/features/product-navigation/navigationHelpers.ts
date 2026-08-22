export const isActiveProductHref = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);
