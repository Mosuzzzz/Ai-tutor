"use client";

import { useProductLanguage } from "../product-navigation/ProductLanguageContext.client";

type DashboardLocalizedTextProps = {
  en: string;
  th: string;
};

export const DashboardLocalizedText = ({ en, th }: DashboardLocalizedTextProps) => {
  const language = useProductLanguage();
  return <>{language === "th" ? th : en}</>;
};

export const DashboardLocalizedDate = ({
  date,
  enPrefix = "",
  includeTime = false,
  thPrefix = ""
}: {
  date: string;
  enPrefix?: string;
  includeTime?: boolean;
  thPrefix?: string;
}) => {
  const language = useProductLanguage();
  const parsed = new Date(date);
  const prefix = language === "th" ? thPrefix : enPrefix;

  if (Number.isNaN(parsed.getTime())) return <>{prefix ? `${prefix} —` : "—"}</>;

  const label = new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-US", {
    ...(includeTime
      ? { dateStyle: "medium" as const, timeStyle: "short" as const }
      : { day: "numeric" as const, month: "short" as const, year: "numeric" as const }),
    timeZone: "Asia/Bangkok"
  }).format(parsed);

  return <>{prefix ? `${prefix} ${label}` : label}</>;
};

export const DashboardGreeting = ({
  displayName,
  leadClassName,
  nameClassName
}: {
  displayName: string | null;
  leadClassName?: string;
  nameClassName?: string;
}) => {
  const language = useProductLanguage();
  const lead = language === "th" ? "กลับมาเรียนต่อกันเถอะ," : "Welcome back,";
  const generic = language === "th" ? "กลับมาเรียนต่อกันเถอะ" : "Ready to keep learning?";

  if (!displayName) return <>{generic}</>;

  return (
    <>
      <span className={leadClassName} data-testid="dashboard-greeting-lead">{lead}</span>{" "}
      <span className={nameClassName} data-testid="dashboard-greeting-name">{displayName}</span>
    </>
  );
};
