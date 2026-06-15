import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  FileSearch,
  FileText,
  MessageSquareText,
  Sparkles
} from "lucide-react";
import Link from "next/link";

import { Card } from "../../components/ui/Card";
import { formatDocumentStatus, parseSummaryMarkdown } from "./documentSummaryHelpers";
import { documentSummaryMock } from "./documentSummaryData";
import type {
  DocumentLibraryItem,
  DocumentSummaryDetail,
  DocumentSummaryStatus,
  DocumentSummaryViewModel
} from "./types";

type DocumentSummaryDetailPageProps = {
  dashboard?: DocumentSummaryViewModel;
  dataSource?: "api" | "api-ready-mock";
  errorMessage?: string;
  status?: DocumentSummaryStatus;
};

const getSelectedDetail = (dashboard: DocumentSummaryViewModel) => {
  return (
    dashboard.documentDetails.find((detail) => detail.id === dashboard.selectedDocumentId) ??
    dashboard.documentDetails[0]
  );
};

const getSelectedLibraryDocument = (
  documents: DocumentLibraryItem[],
  selectedDetail: DocumentSummaryDetail | undefined
) => {
  return documents.find((document) => document.id === selectedDetail?.id);
};

export const DocumentSummaryDetailPage = ({
  dashboard = documentSummaryMock,
  dataSource = "api-ready-mock",
  errorMessage = "ไม่สามารถโหลดรายละเอียดเอกสารได้",
  status = "ready"
}: DocumentSummaryDetailPageProps) => {
  if (status === "loading") {
    return (
      <Card className="text-body-md text-on-surface-variant" role="status">
        กำลังโหลดรายละเอียดเอกสาร
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

  const selectedDetail = getSelectedDetail(dashboard);
  const selectedDocument = getSelectedLibraryDocument(dashboard.apiResponse.documents, selectedDetail);

  if (!selectedDetail) {
    return (
      <div className="space-y-6" data-source={dataSource} data-testid="document-summary-detail">
        <Link
          className="inline-flex items-center gap-2 text-label-md font-bold text-primary hover:text-on-primary-fixed-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
          href="/documents"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          กลับไปคลังเอกสาร
        </Link>
        <Card className="text-center" role="status">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded bg-surface-container text-primary">
            <FileSearch aria-hidden="true" className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-headline-md text-on-surface">ยังไม่มีรายละเอียดสรุปสำหรับเอกสารนี้</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            กลับไปเลือกเอกสารที่ประมวลผลเสร็จแล้ว หรือรอให้ระบบสร้างสรุปให้เรียบร้อยก่อน
          </p>
        </Card>
      </div>
    );
  }

  const parsedSections = parseSummaryMarkdown(selectedDetail.summaryMarkdown);
  const encodedDocumentId = encodeURIComponent(selectedDetail.id);
  const documentStatus = selectedDocument?.status ?? "ready";
  const sourcePreview = selectedDetail.sourcePreview?.trim();

  return (
    <div className="space-y-6" data-source={dataSource} data-testid="document-summary-detail">
      <Link
        className="inline-flex items-center gap-2 text-label-md font-bold text-primary hover:text-on-primary-fixed-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
        href="/documents"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        กลับไปคลังเอกสาร
      </Link>

      <section className="overflow-hidden rounded border border-[#0e2d4f]/10 bg-[#24344d] text-white shadow-ambient">
        <div className="grid gap-6 p-5 md:p-7 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 text-label-sm font-semibold text-[#ffd37a]">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              รายละเอียดสรุปเอกสาร
            </div>
            <h1 className="mt-5 break-words text-headline-lg-mobile font-bold md:text-headline-lg">
              {selectedDetail.filename}
            </h1>
            <p className="mt-3 max-w-3xl text-body-md text-white/80 md:text-body-lg">
              อ่านสรุปฉบับเต็ม ตรวจหัวข้อสำคัญ และต่อยอดเป็นควิซหรือแชทกับ AI จากเอกสารเดียวกัน
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-[#f5b94f] px-4 py-2 text-label-md font-bold text-[#16233a] transition-colors hover:bg-[#ffd37a] focus:outline-none focus:ring-2 focus:ring-[#ffd37a] focus:ring-offset-2 focus:ring-offset-[#24344d]"
                href={`/quiz?documentId=${encodedDocumentId}`}
              >
                สร้างควิซจากเอกสารนี้
                <Bot aria-hidden="true" className="h-5 w-5" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded border border-white/25 bg-white/10 px-4 py-2 text-label-md font-bold text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#24344d]"
                href={`/chat?documentId=${encodedDocumentId}`}
              >
                ถาม AI จากเอกสารนี้
                <MessageSquareText aria-hidden="true" className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <Card className="bg-white/95">
            <div className="flex items-center gap-2 text-label-sm font-semibold text-[#24527a]">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              สถานะเอกสาร
            </div>
            <p className="mt-3 text-display-sm font-bold text-on-surface">{formatDocumentStatus(documentStatus)}</p>
            <dl className="mt-5 grid gap-3 text-body-md text-on-surface-variant">
              <div>
                <dt className="text-label-sm font-bold text-on-surface">ผู้อัปโหลด</dt>
                <dd className="break-words">{selectedDetail.uploadedByLabel}</dd>
              </div>
              <div>
                <dt className="text-label-sm font-bold text-on-surface">วันที่สรุป</dt>
                <dd>{selectedDetail.generatedAtLabel}</dd>
              </div>
              <div>
                <dt className="text-label-sm font-bold text-on-surface">ควิซที่เกี่ยวข้อง</dt>
                <dd>{selectedDocument?.related_exams_count ?? 0} ชุด</dd>
              </div>
            </dl>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section
          aria-label={`สรุปเอกสาร ${selectedDetail.filename}`}
          className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6"
        >
          <div className="flex items-center gap-2 text-label-sm font-semibold text-[#24527a]">
            <FileText aria-hidden="true" className="h-4 w-4" />
            สรุปจาก AI
          </div>
          <h2 className="mt-2 text-headline-md text-on-surface">สรุปเอกสาร</h2>
          <div className="mt-5 grid gap-4">
            {parsedSections.map((section) => (
              <article className="rounded border border-outline-variant/40 bg-[#fbfcff] p-4" key={section.id}>
                <h3 className="break-words text-body-lg font-bold text-on-surface">{section.title}</h3>
                <p className="mt-2 whitespace-pre-line break-words text-body-md text-on-surface-variant">{section.body}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="grid gap-4 self-start">
          <Card>
            <h2 className="text-headline-md text-on-surface">หัวข้อสำคัญ</h2>
            <div className="mt-4 grid gap-4">
              {selectedDetail.keyTopics.map((topic) => (
                <div key={topic.id}>
                  <div className="flex items-center justify-between gap-3 text-label-sm">
                    <span className="break-words font-bold text-on-surface">{topic.title}</span>
                    <span className="shrink-0 text-on-surface-variant">{topic.confidencePercent}%</span>
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

          {sourcePreview && (
            <Card>
              <h2 className="text-headline-md text-on-surface">ตัวอย่างข้อความต้นฉบับ</h2>
              <p className="mt-3 whitespace-pre-line break-words text-body-md text-on-surface-variant">
                {sourcePreview}
              </p>
            </Card>
          )}

          <Card>
            <h2 className="text-headline-md text-on-surface">เอกสารที่เกี่ยวข้อง</h2>
            <div className="mt-4 grid gap-3">
              {selectedDetail.relatedDocuments.length > 0 ? (
                selectedDetail.relatedDocuments.map((document) => (
                  <Link
                    className="group rounded border border-outline-variant/40 bg-[#fbfcff] p-4 transition-colors hover:border-primary-fixed-dim hover:bg-surface-container-lowest"
                    href={document.href}
                    key={document.id}
                  >
                    <div className="min-w-0">
                      <p className="break-words text-body-md font-bold text-on-surface">{document.filename}</p>
                      <p className="mt-1 text-label-sm text-on-surface-variant">
                        สถานะ: {formatDocumentStatus(document.status)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-body-md text-on-surface-variant">ยังไม่มีเอกสารที่เกี่ยวข้อง</p>
              )}
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
};
