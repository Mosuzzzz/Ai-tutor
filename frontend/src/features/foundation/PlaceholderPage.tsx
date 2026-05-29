import type { LucideIcon } from "lucide-react";

import { AppShell } from "../../app/AppShell";
import { Card } from "../../components/ui/Card";

type PlaceholderPageProps = {
  description: string;
  icon: LucideIcon;
  title: string;
};

const readinessItems = ["ใช้ AppShell เดียวกับ Dashboard", "พร้อมต่อ API และ state จริง", "คุมระยะและสีด้วย design tokens"];

export function PlaceholderPage({ description, icon: Icon, title }: PlaceholderPageProps) {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-xl bg-surface-container-low px-6 py-8 md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-on-primary">
                <Icon aria-hidden="true" className="h-6 w-6" />
              </div>
              <h2 className="text-headline-lg-mobile font-bold text-on-surface md:text-headline-lg">
                {title}
              </h2>
              <p className="mt-3 text-body-lg text-on-surface-variant">{description}</p>
            </div>
            <div className="rounded-lg bg-surface-container-lowest px-5 py-4 shadow-ambient">
              <p className="text-label-sm uppercase text-on-surface-variant">Foundation status</p>
              <p className="mt-1 text-headline-md font-bold text-primary">Ready</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {readinessItems.map((item) => (
            <Card key={item} className="min-h-32">
              <p className="text-body-md font-semibold text-on-surface">{item}</p>
              <p className="mt-2 text-body-md text-on-surface-variant">
                หน้านี้เป็นฐาน UI เพื่อให้ต่อ feature เฉพาะทางได้โดยไม่หลุดจาก layout หลัก
              </p>
            </Card>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
