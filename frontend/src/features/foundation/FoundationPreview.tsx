import { ArrowRight, Bot, FileText, Gauge, GraduationCap, Sparkles } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

const previewCards = [
  {
    icon: Sparkles,
    title: "ถาม AI Tutor",
    description: "ช่วยอธิบายเนื้อหายากให้สั้น ชัด และพร้อมทบทวน"
  },
  {
    icon: FileText,
    title: "สรุปเอกสาร",
    description: "เตรียมพื้นที่สำหรับอัปโหลดเอกสารและแสดงสรุปอัตโนมัติ"
  },
  {
    icon: Bot,
    title: "สร้างควิซ",
    description: "ต่อยอดสรุปและบทเรียนเป็นแบบทดสอบด้วย AI"
  }
];

export function FoundationPreview() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <div className="rounded-xl bg-gradient-to-br from-primary to-primary-container p-6 text-on-primary shadow-ambient md:p-8">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-label-sm font-semibold">
            <GraduationCap aria-hidden="true" className="h-4 w-4" />
            Frontend Foundation
          </div>
          <h2 className="max-w-3xl text-headline-lg-mobile font-bold md:text-headline-lg">
            โครง UI กลางสำหรับ AI Tutor พร้อมต่อยอดทุกหน้าใน Stitch
          </h2>
          <p className="mt-4 max-w-2xl text-body-lg text-white/85">
            ใช้ design tokens, sidebar, topbar และ component พื้นฐานชุดเดียวกัน
            เพื่อให้หน้า Dashboard, Document Summary, Chat และ Quiz ไปทางเดียวกัน
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button className="bg-white text-primary hover:bg-primary-fixed" type="button">
              เริ่มเรียนเลย
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Button>
            <Button className="border-white/30 bg-white/10 text-white hover:bg-white/20" type="button">
              ดูภาพรวม
            </Button>
          </div>
        </div>

        <Card className="flex flex-col justify-between gap-8">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-fixed text-primary">
              <Gauge aria-hidden="true" className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-headline-md text-on-surface">ระบบฐานพร้อมใช้งาน</h3>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Foundation นี้เตรียม routing, theme, layout และ reusable UI สำหรับเฟสถัดไป
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-3">
            <Metric label="Tokens" value="32" />
            <Metric label="Routes" value="6" />
            <Metric label="Grid" value="8px" />
          </dl>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {previewCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="min-h-52">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-primary">
                <Icon aria-hidden="true" className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-headline-md text-on-surface">{card.title}</h3>
              <p className="mt-2 text-body-md text-on-surface-variant">{card.description}</p>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-container-low p-3 text-center">
      <dt className="text-label-sm text-on-surface-variant">{label}</dt>
      <dd className="mt-1 text-headline-md font-bold text-primary">{value}</dd>
    </div>
  );
}
