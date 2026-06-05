import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  Download,
  FileSearch,
  FileText,
  MessageSquareText,
  Share2,
  Sparkles,
  TriangleAlert
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  countAvailableSummaries,
  formatDocumentStatus,
  getSelectedDocument,
  parseSummaryMarkdown,
  sortDocumentsByReadiness
} from "./documentSummaryHelpers";
import { documentSummaryMock } from "./documentSummaryData";
import type {
  DocumentProcessingStatus,
  DocumentSummaryDetail,
  DocumentSummaryStatus,
  DocumentSummaryViewModel
} from "./types";

type DocumentSummaryPageProps = {
  dashboard?: DocumentSummaryViewModel;
  dataSource?: "api" | "api-ready-mock";
  errorMessage?: string;
  selectedDocumentId?: string;
  status?: DocumentSummaryStatus;
};

type SummaryMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

const statusToneClassNames: Record<DocumentProcessingStatus, string> = {
  ready: "bg-[#e6f6ee] text-[#216148]",
  processing: "bg-[#fff3d8] text-[#8a5a00]",
  pending: "bg-[#eaf3ff] text-[#24527a]",
  error: "bg-[#ffe9df] text-[#9a3b18]"
};

const getDetailByDocumentId = (
  details: DocumentSummaryDetail[],
  documentId: string | undefined
) => {
  return details.find((detail) => detail.id === documentId) ?? details[0];
};

export const DocumentSummaryPage = ({
  dashboard = documentSummaryMock,
  dataSource = "api-ready-mock",
  errorMessage = "ไม่สามารถโหลดข้อมูลสรุปเอกสารได้",
  selectedDocumentId,
  status = "ready"
}: DocumentSummaryPageProps) => {
  if (status === "loading") {
    return (
      <Card className="text-body-md text-on-surface-variant" role="status">
        กำลังโหลดสรุปเอกสาร
      </Card>
    );
  }

  if (status === "error") {
    return (
      <div
        className="rounded border border-[#f2b8b5] bg-[#fff8f7] p-6 text-body-md font-semibold text-[#8c1d18] shadow-ambient"
        role="alert"
      >
        {errorMessage}
      </div>
    );
  }

  const sortedDocuments = sortDocumentsByReadiness(dashboard.apiResponse.documents);
  const selectedDocument = getSelectedDocument(
    sortedDocuments,
    selectedDocumentId ?? dashboard.selectedDocumentId
  );
  const selectedDetail = getDetailByDocumentId(dashboard.documentDetails, selectedDocument?.id);

  if (!selectedDetail) {
    return (
      <div className="space-y-6" data-source={dataSource} data-testid="document-summary">
        <Card className="text-center" role="status">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded bg-surface-container text-primary">
            <FileSearch aria-hidden="true" className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-headline-md text-on-surface">ยังไม่มีเอกสารที่พร้อมสรุป</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            อัปโหลดเอกสารหรือรอให้ pipeline ประมวลผลเสร็จก่อน
          </p>
        </Card>
      </div>
    );
  }

  const parsedSections = parseSummaryMarkdown(selectedDetail.summaryMarkdown);

  const metrics: SummaryMetric[] = [
    {
      helper: "ในคลังเอกสารของพื้นที่เรียนนี้",
      icon: FileText,
      id: "total-documents",
      label: "เอกสารทั้งหมด",
      tone: "bg-[#eaf3ff] text-[#24527a]",
      value: String(dashboard.apiResponse.total_documents)
    },
    {
      helper: "ใช้ต่อยอดเป็นควิซหรือแชทได้ทันที",
      icon: CheckCircle2,
      id: "ready-summaries",
      label: "พร้อมสรุป",
      tone: "bg-[#e6f6ee] text-[#216148]",
      value: String(countAvailableSummaries(dashboard.apiResponse.documents))
    },
    {
      helper: "รอ pipeline อ่านเนื้อหาให้ครบ",
      icon: Clock3,
      id: "processing-documents",
      label: "กำลังประมวลผล",
      tone: "bg-[#fff3d8] text-[#8a5a00]",
      value: String(dashboard.apiResponse.status_counts.processing)
    },
    {
      helper: "ต้องอัปโหลดใหม่หรือตรวจชนิดไฟล์",
      icon: TriangleAlert,
      id: "error-documents",
      label: "มีปัญหา",
      tone: "bg-[#ffe9df] text-[#9a3b18]",
      value: String(dashboard.apiResponse.status_counts.error)
    }
  ];

  return (
    <div className="space-y-6" data-source={dataSource} data-testid="document-summary">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="overflow-hidden rounded border border-[#0e2d4f]/10 bg-[#24344d] text-white shadow-ambient">
          <div className="p-5 md:p-7">
            <div className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 text-label-sm font-semibold text-[#ffd37a]">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              {dashboard.workspaceName}
            </div>
            <h2 className="mt-5 text-headline-lg-mobile font-bold md:text-headline-lg">
              สรุปเอกสารด้วย AI
            </h2>
            <p className="mt-3 max-w-3xl text-body-md text-white/80 md:text-body-lg">
              เลือกเอกสารที่ผ่านการประมวลผลแล้วเพื่อดูสรุป หัวข้อสำคัญ และต่อยอดไปยังควิซหรือแชทกับ AI Tutor
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-[#f5b94f] px-4 py-2 text-label-md font-bold text-[#16233a] transition-colors hover:bg-[#ffd37a] focus:outline-none focus:ring-2 focus:ring-[#ffd37a] focus:ring-offset-2 focus:ring-offset-[#24344d]"
                href="/quiz"
              >
                สร้างควิซจากสรุปนี้
                <Bot aria-hidden="true" className="h-5 w-5" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded border border-white/25 bg-white/10 px-4 py-2 text-label-md font-bold text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#24344d]"
                href="/chat"
              >
                ถาม AI จากเอกสารนี้
                <MessageSquareText aria-hidden="true" className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <Card>
          <div className="flex items-center gap-2 text-label-sm font-semibold text-[#24527a]">
            <FileSearch aria-hidden="true" className="h-4 w-4" />
            เอกสารที่เลือก
          </div>
          <h3 className="mt-3 text-headline-md text-on-surface">{selectedDetail.filename}</h3>
          <p className="mt-2 text-body-md text-on-surface-variant">{selectedDetail.uploadedByLabel}</p>
          <p className="mt-1 text-body-md text-on-surface-variant">{selectedDetail.generatedAtLabel}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button disabled variant="secondary">
              <Download aria-hidden="true" className="h-4 w-4" />
              ส่งออกสรุป
            </Button>
            <Button disabled variant="ghost">
              <Share2 aria-hidden="true" className="h-4 w-4" />
              แชร์สรุป
            </Button>
          </div>
        </Card>
      </section>

      <section aria-label="ตัวชี้วัดเอกสาร" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-label-sm font-semibold uppercase text-on-surface-variant">{metric.label}</p>
                  <p className="mt-2 text-display-lg font-bold text-on-surface">{metric.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded ${metric.tone}`}>
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-body-md text-on-surface-variant">{metric.helper}</p>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section
          aria-label="รายละเอียดสรุปเอกสารที่เลือก"
          className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-label-sm font-semibold text-[#24527a]">สรุปที่เลือก</p>
              <h3 className="mt-2 text-headline-md text-on-surface">{selectedDetail.filename}</h3>
            </div>
            <span className="rounded bg-[#e6f6ee] px-3 py-1.5 text-label-sm font-bold text-[#216148]">
              พร้อมใช้งานกับ AI
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            <section aria-labelledby="summary-sections-heading">
              <h4 id="summary-sections-heading" className="text-headline-sm text-on-surface">
                รายละเอียดสรุป
              </h4>
              <div className="mt-3 grid gap-3">
                {parsedSections.map((section) => (
                  <article className="rounded border border-outline-variant/40 bg-[#fbfcff] p-4" key={section.id}>
                    <h5 className="text-body-lg font-bold text-on-surface">{section.title}</h5>
                    <p className="mt-2 whitespace-pre-line text-body-md text-on-surface-variant">{section.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="breakdown-heading">
              <h4 id="breakdown-heading" className="text-headline-sm text-on-surface">
                รายละเอียดเชิงลึก
              </h4>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {selectedDetail.detailedBreakdown.map((item) => (
                  <article className="rounded border border-outline-variant/40 bg-surface-container-low p-4" key={item.id}>
                    <h5 className="text-body-md font-bold text-on-surface">{item.title}</h5>
                    <p className="mt-2 text-body-md text-on-surface-variant">{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <aside className="grid gap-4">
          <Card>
            <h3 className="text-headline-md text-on-surface">หัวข้อสำคัญ</h3>
            <div className="mt-4 grid gap-4">
              {selectedDetail.keyTopics.map((topic) => (
                <div key={topic.id}>
                  <div className="flex items-center justify-between gap-3 text-label-sm">
                    <span className="font-bold text-on-surface">{topic.title}</span>
                    <span className="text-on-surface-variant">{topic.confidencePercent}%</span>
                  </div>
                  <div
                    aria-label={`${topic.title} ความมั่นใจ ${topic.confidencePercent}%`}
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={topic.confidencePercent}
                    className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container"
                    role="progressbar"
                  >
                    <div
                      aria-hidden="true"
                      className="h-full rounded-full bg-[#24527a]"
                      style={{ width: `${topic.confidencePercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-headline-md text-on-surface">เอกสารที่เกี่ยวข้อง</h3>
            <div className="mt-4 grid gap-3">
              {selectedDetail.relatedDocuments.map((document) => (
                <Link
                  className="group rounded border border-outline-variant/40 bg-[#fbfcff] p-4 transition-colors hover:border-primary-fixed-dim hover:bg-surface-container-lowest"
                  href={document.href}
                  key={document.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-body-md font-bold text-on-surface">{document.filename}</p>
                      <p className="mt-1 text-label-sm text-on-surface-variant">
                        สถานะ: {formatDocumentStatus(document.status)}
                      </p>
                    </div>
                    <ArrowRight
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-headline-md text-on-surface">เอกสารในคลัง</h3>
            <div className="mt-4 grid gap-3">
              {sortedDocuments.map((document) => (
                <article className="rounded border border-outline-variant/40 bg-[#fbfcff] p-4" key={document.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-body-md font-bold text-on-surface">{document.filename}</p>
                      <p className="mt-1 text-label-sm text-on-surface-variant">
                        โดย {document.uploaded_by} - ควิซ {document.related_exams_count} ชุด
                      </p>
                    </div>
                    <span className={`shrink-0 rounded px-3 py-1 text-label-sm font-bold ${statusToneClassNames[document.status]}`}>
                      สถานะ: {formatDocumentStatus(document.status)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
};
