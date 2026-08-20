import Link from "next/link";

import type { AuthSession } from "../auth/types";
import { HomeBrand } from "./HomeBrand";
import { HOME_CONTENT, HOME_NAVIGATION } from "./homeContent";
import type { HomeLanguage } from "./types";

export const HomeFooter = ({ language, session }: { language: HomeLanguage; session: AuthSession | null }) => {
  const content = HOME_CONTENT[language];
  return <footer className="home-footer"><div className="home-footer-grid"><div><HomeBrand /><p>{content.footer.description}</p></div><nav aria-label={content.footer.productLabel}><strong>{content.footer.productLabel}</strong>{HOME_NAVIGATION.map((item) => <Link href={item.href} key={item.href}>{content.navigation[item.key]}</Link>)}</nav><nav aria-label={content.footer.accountLabel}><strong>{content.footer.accountLabel}</strong>{session ? <Link href="/dashboard">{content.navigation.myWorkspace}</Link> : <><Link href="/login">{content.navbar.loginLabel}</Link><Link href="/register">{content.navigation.startStudying}</Link></>}</nav></div><p className="home-footer-note">{content.footer.rights}</p></footer>;
};
