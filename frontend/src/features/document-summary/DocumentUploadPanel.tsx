"use client";

import { CheckCircle2, Clock3, FileUp, ShieldCheck, TriangleAlert } from "lucide-react";
import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  getDocumentProcessingStatus,
  submitDocumentUpload,
  validateDocumentUploadFile,
  type DocumentStatusResult,
  type DocumentUploadResult,
  type UploadedDocumentStatus
} from "./documentUploadApiClient";
import type { DocumentProcessingStatus } from "./types";

type DocumentUploadPanelProps = {
  canUpload: boolean;
  fetchStatus?: (fileId: string) => Promise<DocumentStatusResult>;
  pollIntervalMs?: number;
  submitUpload?: ({ file }: { file: File | null | undefined }) => Promise<DocumentUploadResult>;
};

const uploadStatusLabels: Record<DocumentProcessingStatus, string> = {
  error: "ประมวลผลไม่สำเร็จ",
  pending: "รอเริ่มประมวลผล",
  processing: "กำลังประมวลผลเอกสาร",
  ready: "พร้อมใช้งานกับ AI"
};

const statusToneClassNames: Record<DocumentProcessingStatus, string> = {
  error: "border-[#f2b8b5] bg-[#fff8f7] text-[#8c1d18]",
  pending: "border-[#c7d7ed] bg-[#f4f8ff] text-[#24527a]",
  processing: "border-[#f2d58a] bg-[#fff8ea] text-[#8a5a00]",
  ready: "border-[#bfe4cf] bg-[#f1fbf6] text-[#216148]"
};

const shouldPollStatus = (status: DocumentProcessingStatus) => status === "pending" || status === "processing";

export const DocumentUploadPanel = ({
  canUpload,
  fetchStatus = getDocumentProcessingStatus,
  pollIntervalMs = 3_000,
  submitUpload = submitDocumentUpload
}: DocumentUploadPanelProps) => {
  const inputId = useId();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocumentStatus | null>(null);
  const uploadedDocumentId = uploadedDocument?.id;
  const uploadedDocumentStatus = uploadedDocument?.status;

  useEffect(() => {
    if (!uploadedDocumentId || !uploadedDocumentStatus || !shouldPollStatus(uploadedDocumentStatus)) {
      return undefined;
    }

    let isActive = true;
    const intervalId = window.setInterval(() => {
      void fetchStatus(uploadedDocumentId).then((result) => {
        if (!isActive) {
          return;
        }

        if (result.ok) {
          setUploadedDocument(result.document);
          router.refresh();
          return;
        }

        setErrorMessage(result.message);
      });
    }, pollIntervalMs);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [fetchStatus, pollIntervalMs, router, uploadedDocumentId, uploadedDocumentStatus]);

  if (!canUpload) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-surface-container text-primary">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-headline-sm text-on-surface">ยังไม่สามารถอัปโหลดเอกสารได้</h3>
            <p className="mt-2 text-body-md text-on-surface-variant">
              สิทธิ์อัปโหลดจาก backend ยังไม่เปิดสำหรับบัญชีนี้ เมื่อระบบเปิดสิทธิ์แล้วพื้นที่นี้จะใช้เพิ่มเอกสารส่วนตัวได้ทันที
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const currentStatus = uploadedDocument?.status;
  const isProcessing = currentStatus ? shouldPollStatus(currentStatus) : false;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    setUploadedDocument(null);
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const validation = validateDocumentUploadFile(selectedFile);
    if (!validation.ok) {
      setErrorMessage(validation.message);
      return;
    }

    setIsSubmitting(true);
    const result = await submitUpload({ file: validation.file });
    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    setUploadedDocument(result.document);
    router.refresh();
  };

  return (
    <Card>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-[#f4f8ff] text-[#24527a]">
            <FileUp aria-hidden="true" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-headline-sm text-on-surface">อัปโหลดเอกสารของฉัน</h3>
            <p className="mt-2 text-body-md text-on-surface-variant">
              รองรับ PDF, Word, PowerPoint และรูปภาพ ขนาดไม่เกิน 50 MB หลังอัปโหลดระบบจะเริ่มประมวลผลอัตโนมัติ
            </p>
          </div>
        </div>

        <div>
          <label className="text-label-md font-bold text-on-surface" htmlFor={inputId}>
            เลือกไฟล์เอกสาร
          </label>
          <input
            accept=".pdf,.docx,.doc,.pptx,.ppt,.png,.jpg,.jpeg,.webp"
            className="mt-2 block w-full rounded border border-outline-variant/60 bg-surface-container-lowest px-3 py-3 text-body-md text-on-surface file:mr-4 file:rounded file:border-0 file:bg-primary file:px-3 file:py-2 file:text-label-sm file:font-bold file:text-on-primary focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
            id={inputId}
            name="file"
            onChange={handleFileChange}
            type="file"
          />
          {selectedFile && (
            <p className="mt-2 break-words text-label-sm text-on-surface-variant">
              เลือกแล้ว: <span className="font-semibold text-on-surface">{selectedFile.name}</span>
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="rounded border border-[#f2b8b5] bg-[#fff8f7] p-3 text-body-md font-semibold text-[#8c1d18]" role="alert">
            {errorMessage}
          </div>
        )}

        {uploadedDocument && (
          <div
            className={`rounded border p-4 ${statusToneClassNames[uploadedDocument.status]}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              {uploadedDocument.status === "ready" ? (
                <CheckCircle2 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0" />
              ) : uploadedDocument.status === "error" ? (
                <TriangleAlert aria-hidden="true" className="mt-1 h-5 w-5 shrink-0" />
              ) : (
                <Clock3 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="break-words text-body-md font-bold">{uploadedDocument.filename}</p>
                <p className="mt-1 text-body-md">{uploadStatusLabels[uploadedDocument.status]}</p>
              </div>
            </div>
            {isProcessing && (
              <div
                aria-label="สถานะการประมวลผลเอกสาร"
                className="mt-3 h-2 overflow-hidden rounded-full bg-white/70"
                role="progressbar"
              >
                <div aria-hidden="true" className="h-full w-2/3 animate-pulse rounded-full bg-current" />
              </div>
            )}
          </div>
        )}

        <Button className="w-full sm:w-auto" disabled={isSubmitting} type="submit">
          <FileUp aria-hidden="true" className="h-4 w-4" />
          {isSubmitting ? "กำลังอัปโหลด" : "อัปโหลดเอกสาร"}
        </Button>
      </form>
    </Card>
  );
};
