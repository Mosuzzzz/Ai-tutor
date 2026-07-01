"use client";

import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  FileSearch,
  FileText,
  MessageSquareText,
  Sparkles,
  Trash2,
  TriangleAlert,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  buildDocumentDetailHref,
  countAvailableSummaries,
  formatDocumentStatus,
  getRecentDocuments,
  getSelectedDocument,
  parseSummaryMarkdown,
  sortDocumentsByLatestUpload,
  sortDocumentsByReadiness
} from "./documentSummaryHelpers";
import { deleteDocumentFromLibrary } from "./documentDeleteClient";
import { DocumentUploadPanel } from "./DocumentUploadPanel";
import { documentSummaryMock } from "./documentSummaryData";
import type {
  DocumentLibraryItem,
  DocumentProcessingStatus,
  DocumentSummaryDetail,
  DocumentSummaryStatus,
  DocumentSummaryViewModel,
  DocumentStatusCounts
} from "./types";

type DocumentSummaryPageProps = {
  canUploadDocuments?: boolean;
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

const countDocumentStatuses = (documents: DocumentLibraryItem[]): DocumentStatusCounts => {
  return documents.reduce<DocumentStatusCounts>(
    (counts, document) => {
      counts[document.status] += 1;
      return counts;
    },
    {
      error: 0,
      pending: 0,
      processing: 0,
      ready: 0
    }
  );
};

export const DocumentSummaryPage = ({
  canUploadDocuments = false,
  dashboard = documentSummaryMock,
  dataSource = "api-ready-mock",
  errorMessage = "ไม่สามารถโหลดข้อมูลสรุปเอกสารได้",
  selectedDocumentId,
  status = "ready"
}: DocumentSummaryPageProps) => {
  const [removedDocumentIds, setRemovedDocumentIds] = useState<Set<string>>(() => new Set());
  const [deletePendingId, setDeletePendingId] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const libraryDialogCloseButtonRef = useRef<HTMLButtonElement>(null);
  const libraryDialogOpenerRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreLibraryFocusRef = useRef(false);

  useLayoutEffect(() => {
    if (isLibraryDialogOpen) {
      libraryDialogCloseButtonRef.current?.focus();
      return;
    }

    if (shouldRestoreLibraryFocusRef.current) {
      shouldRestoreLibraryFocusRef.current = false;
      libraryDialogOpenerRef.current?.focus();
    }
  }, [isLibraryDialogOpen]);

  const closeLibraryDialog = () => {
    shouldRestoreLibraryFocusRef.current = true;
    setIsLibraryDialogOpen(false);
  };

  const handleLibraryDialogKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeLibraryDialog();
    }
  };

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

  const visibleDocuments = dashboard.apiResponse.documents.filter((document) => !removedDocumentIds.has(document.id));
  const visibleDocumentDetails = dashboard.documentDetails.filter((detail) => !removedDocumentIds.has(detail.id));
  const sortedDocuments = sortDocumentsByReadiness(visibleDocuments);
  const latestDocuments = sortDocumentsByLatestUpload(sortedDocuments);
  const previewDocuments = getRecentDocuments(sortedDocuments, 2);
  const selectedDocument = getSelectedDocument(
    sortedDocuments,
    selectedDocumentId ?? dashboard.selectedDocumentId
  );
  const selectedDetail = getDetailByDocumentId(visibleDocumentDetails, selectedDocument?.id);

  if (!selectedDetail) {
    return (
      <div className="space-y-6" data-source={dataSource} data-testid="document-summary">
        {canUploadDocuments && (
          <section aria-label="อัปโหลดเอกสาร">
            <DocumentUploadPanel canUpload={canUploadDocuments} />
          </section>
        )}
        <Card className="text-center" role="status">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded bg-surface-container text-primary">
            <FileSearch aria-hidden="true" className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-headline-md text-on-surface">ยังไม่มีเอกสารพร้อมสรุป</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            อัปโหลดเอกสารแรกหรือรอให้ระบบประมวลผลเสร็จ แล้วต่อยอดเป็นสรุป แชทกับเอกสาร หรือควิซทบทวนได้จากพื้นที่เดียวกัน
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded border border-primary-container/20 bg-surface-container-low px-4 py-2 text-label-md font-bold text-primary transition-colors hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
              href="/"
            >
              กลับแดชบอร์ด
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const parsedSections = parseSummaryMarkdown(selectedDetail.summaryMarkdown);
  const encodedDocumentId = encodeURIComponent(selectedDetail.id);
  const canUseSelectedDocumentAiActions = selectedDetail.canUseAiActions;
  const aiReadinessLabel = canUseSelectedDocumentAiActions ? "พร้อมใช้งานกับ AI" : "รอสรุปจริงจาก Backend";
  const aiReadinessBadgeClassName = canUseSelectedDocumentAiActions
    ? "border-[#b7dfc8] bg-[#eefaf3] text-[#216148]"
    : "border-[#f5d08a] bg-[#fff8e6] text-[#7c4a03]";
  const AiReadinessIcon = canUseSelectedDocumentAiActions ? CheckCircle2 : TriangleAlert;
  const visibleStatusCounts = countDocumentStatuses(sortedDocuments);

  const handleDeleteDocument = async (document: DocumentLibraryItem) => {
    if (!canUploadDocuments || deletePendingId) {
      return;
    }

    setDeleteError("");
    setDeleteMessage("");

    const confirmed = window.confirm(`ต้องการลบเอกสาร "${document.filename}" ออกจากคลังใช่ไหม?`);

    if (!confirmed) {
      return;
    }

    setDeletePendingId(document.id);
    const result = await deleteDocumentFromLibrary(document.id);
    setDeletePendingId("");

    if (result.ok) {
      setRemovedDocumentIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.add(result.document.id);
        return nextIds;
      });
      setDeleteMessage(result.message);
      return;
    }

    setDeleteError(result.message);
  };

  const metrics: SummaryMetric[] = [
    {
      helper: "ในคลังเอกสารของพื้นที่เรียนนี้",
      icon: FileText,
      id: "total-documents",
      label: "เอกสารทั้งหมด",
      tone: "bg-[#eaf3ff] text-[#24527a]",
      value: String(sortedDocuments.length)
    },
    {
      helper: "ใช้ต่อยอดเป็นควิซหรือแชทได้ทันที",
      icon: CheckCircle2,
      id: "ready-summaries",
      label: "พร้อมสรุป",
      tone: "bg-[#e6f6ee] text-[#216148]",
      value: String(countAvailableSummaries(sortedDocuments))
    },
    {
      helper: "รอระบบอ่านเนื้อหาให้ครบ",
      icon: Clock3,
      id: "processing-documents",
      label: "กำลังประมวลผล",
      tone: "bg-[#fff3d8] text-[#8a5a00]",
      value: String(visibleStatusCounts.processing)
    },
    {
      helper: "ต้องอัปโหลดใหม่หรือตรวจชนิดไฟล์",
      icon: TriangleAlert,
      id: "error-documents",
      label: "มีปัญหา",
      tone: "bg-[#ffe9df] text-[#9a3b18]",
      value: String(visibleStatusCounts.error)
    }
  ];

  return (
    <div className="space-y-6" data-source={dataSource} data-testid="document-summary">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div
          className="min-w-0 overflow-hidden rounded border border-[#0e2d4f]/10 bg-[#24344d] text-white shadow-ambient"
          data-testid="document-summary-hero"
        >
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
              {canUseSelectedDocumentAiActions ? (
                <>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-[#f5b94f] px-4 py-2 text-label-md font-bold text-[#16233a] transition-colors hover:bg-[#ffd37a] focus:outline-none focus:ring-2 focus:ring-[#ffd37a] focus:ring-offset-2 focus:ring-offset-[#24344d]"
                    href={`/quiz?documentId=${encodedDocumentId}`}
                  >
                    สร้างควิซจากสรุปนี้
                    <Bot aria-hidden="true" className="h-5 w-5" />
                  </Link>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded border border-white/25 bg-white/10 px-4 py-2 text-label-md font-bold text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#24344d]"
                    href={`/chat?documentId=${encodedDocumentId}`}
                  >
                    ถาม AI จากเอกสารนี้
                    <MessageSquareText aria-hidden="true" className="h-5 w-5" />
                  </Link>
                </>
              ) : (
                <div className="flex max-w-3xl items-start gap-3 rounded border border-[#f5d08a]/70 bg-[#fff8e6] px-4 py-3 text-body-md font-semibold text-[#7c4a03]" role="status">
                  <TriangleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{selectedDetail.summaryNotice ?? "กำลังรอสรุปจากเนื้อหาเอกสารจริงก่อนเปิดใช้ AI"}</span>
                </div>
              )}
            </div>
            <ol
              aria-label="ลำดับการใช้งาน AI จากเอกสาร"
              className="mt-6 grid gap-2 text-label-sm font-semibold text-white/80 sm:grid-cols-3"
            >
              {["1 อัปโหลดเอกสาร", "2 อ่านสรุป", "3 ถาม AI หรือสร้างควิซ"].map((step) => (
                <li className="rounded border border-white/15 bg-white/10 px-3 py-2" key={step}>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <Card className="min-w-0 overflow-hidden" data-testid="document-summary-selected-card">
          <div className="flex items-center gap-2 text-label-sm font-semibold text-[#24527a]">
            <FileSearch aria-hidden="true" className="h-4 w-4" />
            เอกสารที่เลือก
          </div>
          <h3 className="mt-3 break-words text-headline-md text-on-surface">{selectedDetail.filename}</h3>
          <p className="mt-2 text-body-md text-on-surface-variant">{selectedDetail.uploadedByLabel}</p>
          <p className="mt-1 text-body-md text-on-surface-variant">{selectedDetail.generatedAtLabel}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-primary-container/20 bg-surface-container-low px-4 py-2 text-label-md font-bold text-primary transition-all duration-200 hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
              href={buildDocumentDetailHref(selectedDetail.id)}
            >
              <FileSearch aria-hidden="true" className="h-4 w-4" />
              ดูรายละเอียดเอกสาร
            </Link>
            <span className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-label-md font-bold ${aiReadinessBadgeClassName}`}>
              <AiReadinessIcon aria-hidden="true" className="h-4 w-4" />
              {aiReadinessLabel}
            </span>
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

      {canUploadDocuments && (
        <section aria-label="อัปโหลดเอกสาร">
          <DocumentUploadPanel canUpload={canUploadDocuments} />
        </section>
      )}

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
            <span className={`rounded border px-3 py-1.5 text-label-sm font-bold ${aiReadinessBadgeClassName}`}>
              {aiReadinessLabel}
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            <section aria-labelledby="summary-sections-heading">
              <h4 id="summary-sections-heading" className="text-headline-sm text-on-surface">
                รายละเอียดสรุป
              </h4>
              <div className="mt-3 grid gap-3">
                {parsedSections.length > 0 ? (
                  parsedSections.map((section) => (
                    <article className="rounded border border-outline-variant/40 bg-[#fbfcff] p-4" key={section.id}>
                      <h5 className="text-body-lg font-bold text-on-surface">{section.title}</h5>
                      <p className="mt-2 whitespace-pre-line text-body-md text-on-surface-variant">{section.body}</p>
                    </article>
                  ))
                ) : (
                  <article className="rounded border border-[#f5d08a]/70 bg-[#fff8e6] p-4 text-body-md font-semibold text-[#7c4a03]" role="status">
                    {selectedDetail.summaryNotice ?? "ยังไม่มีสรุปจากเนื้อหาเอกสารจริง"}
                  </article>
                )}
              </div>
            </section>

            <section aria-labelledby="breakdown-heading">
              <h4 id="breakdown-heading" className="text-headline-sm text-on-surface">
                รายละเอียดเชิงลึก
              </h4>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {selectedDetail.detailedBreakdown.length > 0 ? (
                  selectedDetail.detailedBreakdown.map((item) => (
                    <article className="rounded border border-outline-variant/40 bg-surface-container-low p-4" key={item.id}>
                      <h5 className="text-body-md font-bold text-on-surface">{item.title}</h5>
                      <p className="mt-2 text-body-md text-on-surface-variant">{item.body}</p>
                    </article>
                  ))
                ) : (
                  <article className="rounded border border-outline-variant/40 bg-surface-container-low p-4 text-body-md text-on-surface-variant">
                    รอ backend ส่งตัวอย่างข้อความหรือสรุปจริงจากเอกสาร
                  </article>
                )}
              </div>
            </section>
          </div>
        </section>

        <aside className="grid gap-4">
          <Card>
            <h3 className="text-headline-md text-on-surface">หัวข้อสำคัญ</h3>
            <div className="mt-4 grid gap-4">
              {selectedDetail.keyTopics.length > 0 ? (
                selectedDetail.keyTopics.map((topic) => (
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
                ))
              ) : (
                <p className="text-body-md text-on-surface-variant">ยังไม่มีหัวข้อสำคัญจนกว่า backend จะส่งสรุปจากเอกสารจริง</p>
              )}
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
            {deleteMessage && (
              <p className="mt-3 rounded border border-[#b7dfc8] bg-[#eefaf3] px-3 py-2 text-label-sm font-semibold text-[#216148]" role="status">
                {deleteMessage}
              </p>
            )}
            {deleteError && (
              <p className="mt-3 rounded border border-[#f2b8b5] bg-[#fff8f7] px-3 py-2 text-label-sm font-semibold text-[#8c1d18]" role="alert">
                {deleteError}
              </p>
            )}
            <section aria-label="เอกสารล่าสุดในคลัง" className="mt-4 grid gap-3">
              {previewDocuments.map((document) => (
                <article
                  aria-label={`เอกสารในคลัง ${document.filename}`}
                  className="rounded border border-outline-variant/40 bg-[#fbfcff] p-4"
                  key={document.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-body-md font-bold text-on-surface">{document.filename}</p>
                      <p className="mt-1 text-label-sm text-on-surface-variant">
                        โดย {document.uploaded_by} - ควิซ {document.related_exams_count} ชุด
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <span className={`rounded px-3 py-1 text-label-sm font-bold ${statusToneClassNames[document.status]}`}>
                        สถานะ: {formatDocumentStatus(document.status)}
                      </span>
                      {canUploadDocuments && (
                        <Button
                          aria-label={`ลบเอกสาร ${document.filename}`}
                          className="min-h-9 px-3 py-1 text-label-sm"
                          disabled={deletePendingId === document.id}
                          onClick={() => {
                            void handleDeleteDocument(document);
                          }}
                          variant="danger"
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                          {deletePendingId === document.id ? "กำลังลบ" : "ลบ"}
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </section>
            {latestDocuments.length > 2 && (
              <Button
                className="mt-4 w-full justify-between"
                onClick={() => {
                  setIsLibraryDialogOpen(true);
                }}
                ref={libraryDialogOpenerRef}
                variant="secondary"
              >
                ดูเอกสารทั้งหมดในคลัง
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            )}
          </Card>
        </aside>
      </section>

      {isLibraryDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/55 p-4"
          onClick={() => {
            closeLibraryDialog();
          }}
        >
          <section
            aria-labelledby="document-library-dialog-title"
            aria-modal="true"
            className="max-h-[min(720px,90vh)] w-full max-w-3xl overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-ambient"
            onKeyDown={handleLibraryDialogKeyDown}
            onClick={(event) => {
              event.stopPropagation();
            }}
            role="dialog"
            tabIndex={-1}
          >
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant/40 p-5">
              <div className="min-w-0">
                <p className="text-label-sm font-semibold text-[#24527a]">คลังเอกสาร</p>
                <h3 id="document-library-dialog-title" className="mt-1 text-headline-md text-on-surface">
                  เอกสารทั้งหมดในคลัง
                </h3>
                <p className="mt-1 text-body-md text-on-surface-variant">
                  รวม {latestDocuments.length} รายการ เรียงจากล่าสุดก่อน
                </p>
              </div>
              <Button
                aria-label="ปิดคลังเอกสารทั้งหมด"
                className="min-h-10 px-3"
                onClick={() => {
                  closeLibraryDialog();
                }}
                ref={libraryDialogCloseButtonRef}
                variant="ghost"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </Button>
            </header>
            <div className="max-h-[60vh] overflow-y-auto p-5">
              <div className="grid gap-3">
                {latestDocuments.map((document) => (
                  <article
                    aria-label={`เอกสารทั้งหมดในคลัง ${document.filename}`}
                    className="rounded border border-outline-variant/40 bg-[#fbfcff] p-4"
                    key={`dialog-${document.id}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-body-md font-bold text-on-surface">{document.filename}</p>
                        <p className="mt-1 text-label-sm text-on-surface-variant">
                          โดย {document.uploaded_by} - ควิซ {document.related_exams_count} ชุด
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <span className={`rounded px-3 py-1 text-label-sm font-bold ${statusToneClassNames[document.status]}`}>
                          สถานะ: {formatDocumentStatus(document.status)}
                        </span>
                        {canUploadDocuments && (
                          <Button
                            aria-label={`ลบเอกสาร ${document.filename}`}
                            className="min-h-9 px-3 py-1 text-label-sm"
                            disabled={deletePendingId === document.id}
                            onClick={() => {
                              void handleDeleteDocument(document);
                            }}
                            variant="danger"
                          >
                            <Trash2 aria-hidden="true" className="h-4 w-4" />
                            {deletePendingId === document.id ? "กำลังลบ" : "ลบ"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
