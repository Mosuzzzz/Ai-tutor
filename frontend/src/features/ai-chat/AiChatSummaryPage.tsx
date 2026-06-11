"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bot,
  FileText,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
  TriangleAlert
} from "lucide-react";
import Link from "next/link";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { cn } from "../../lib/cn";
import { submitDocumentChatQuestion } from "./aiChatQueryClient";
import {
  buildCitationLabel,
  countGroundedAssistantMessages,
  formatChatDocumentStatus,
  getMessageTone,
  getSelectedChatDocument,
  sortChatDocumentsByAvailability
} from "./aiChatHelpers";
import { aiChatSummaryMock } from "./aiChatData";
import { toDocumentContextChatMessages } from "./aiChatMapper";
import type {
  AiChatSummaryStatus,
  AiChatSummaryViewModel,
  ChatDocument,
  ChatDocumentStatus,
  ChatMessage
} from "./types";

type AiChatSummaryPageProps = {
  chat?: AiChatSummaryViewModel;
  dataSource?: "api" | "api-ready-mock";
  errorMessage?: string;
  selectedDocumentId?: string;
  status?: AiChatSummaryStatus;
};

const statusToneClassNames: Record<ChatDocumentStatus, string> = {
  error: "bg-[#ffe9df] text-[#9a3b18]",
  pending: "bg-[#eaf3ff] text-[#24527a]",
  processing: "bg-[#fff3d8] text-[#8a5a00]",
  ready: "bg-[#e6f6ee] text-[#216148]"
};

const messageToneClassNames: Record<ReturnType<typeof getMessageTone>, string> = {
  assistant: "border-[#d8e5f5] bg-[#fbfdff] text-on-surface",
  learner: "border-[#2d5f72] bg-[#2d5f72] text-white"
};

const linkClassName =
  "inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded border border-[#2d5f72]/15 bg-white px-4 py-2 text-left text-label-md font-bold text-[#2d5f72] transition-colors hover:bg-[#edf6f8] focus:outline-none focus:ring-2 focus:ring-[#5ba8b5] focus:ring-offset-2";

const DocumentSelector = ({
  documents,
  selectedDocument
}: {
  documents: ChatDocument[];
  selectedDocument: ChatDocument;
}) => {
  return (
    <Card className="min-w-0 overflow-hidden p-5" data-testid="ai-chat-document-selector">
      <div className="flex items-center gap-2 text-label-sm font-semibold text-[#2d5f72]">
        <FileText aria-hidden="true" className="h-4 w-4" />
        เอกสารสำหรับสนทนา
      </div>
      <div className="mt-4 grid gap-3">
        {documents.map((document) => {
          const isSelected = document.id === selectedDocument.id;

          return (
            <article
              aria-label={`เอกสารที่${isSelected ? "เลือก" : "มี"} ${document.filename}`}
              className={cn(
                "min-w-0 overflow-hidden rounded border p-4 transition-colors",
                isSelected
                  ? "border-[#2d5f72] bg-[#edf6f8]"
                  : "border-outline-variant/40 bg-surface-container-lowest"
              )}
              key={document.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-body-md font-bold text-on-surface">{document.filename}</p>
                  <p className="mt-1 text-label-sm text-on-surface-variant">{document.ownerLabel}</p>
                </div>
                <span className={cn("max-w-full shrink-0 rounded px-3 py-1 text-label-sm font-bold", statusToneClassNames[document.status])}>
                  {formatChatDocumentStatus(document.status)}
                </span>
              </div>
              <p className="mt-3 break-words text-body-md text-on-surface-variant">{document.summary}</p>
              <p className="mt-2 text-label-sm font-semibold text-on-surface-variant">
                {document.updatedAtLabel} · {document.topicCount} หัวข้อ
              </p>
            </article>
          );
        })}
      </div>
    </Card>
  );
};

const ChatThread = ({ messages }: { messages: ChatMessage[] }) => {
  return (
    <Card className="min-w-0 overflow-hidden p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label-sm font-semibold text-[#2d5f72]">Grounded RAG Chat</p>
          <h3 className="mt-1 break-words text-headline-md text-on-surface">บทสนทนาอ้างอิงเอกสาร</h3>
        </div>
        <span className="rounded bg-[#e6f6ee] px-3 py-1 text-label-sm font-bold text-[#216148]">
          {countGroundedAssistantMessages(messages)} คำตอบมี citation
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        {messages.map((message) => {
          const tone = getMessageTone(message.role);

          return (
            <article
              className={cn(
                "w-full max-w-full min-w-0 overflow-hidden rounded border p-4 break-words sm:max-w-[92%]",
                message.role === "learner" ? "justify-self-end" : "justify-self-start",
                messageToneClassNames[tone]
              )}
              key={message.id}
            >
              <div className="flex items-center justify-between gap-4 text-label-sm font-bold">
                <span>{message.role === "assistant" ? "AI Tutor" : "ผู้เรียน"}</span>
                <span>{message.createdAtLabel}</span>
              </div>
              <p className="mt-3 whitespace-pre-line break-words text-body-md">{message.body}</p>

              {message.citations.length > 0 ? (
                <div className="mt-4 grid gap-2">
                  {message.citations.map((citation) => (
                    <div
                      className="min-w-0 overflow-hidden rounded border border-[#d8e5f5] bg-white p-3 text-label-sm text-on-surface-variant"
                      key={`${message.id}-${citation.file_id}-${citation.chunk_index}`}
                    >
                      <p className="break-words font-bold text-[#2d5f72]">{buildCitationLabel(citation)}</p>
                      <p className="mt-1 break-words">{citation.matched_text}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </Card>
  );
};

const SummaryPanel = ({ chat, selectedDocument }: { chat: AiChatSummaryViewModel; selectedDocument: ChatDocument }) => {
  const selectedDocumentQuery = encodeURIComponent(selectedDocument.id);

  return (
    <aside className="grid min-w-0 gap-4 overflow-hidden" data-testid="ai-chat-summary-panel">
      <Card>
        <div className="flex items-center gap-2 text-label-sm font-semibold text-[#2d5f72]">
          <ShieldCheck aria-hidden="true" className="h-4 w-4" />
          เอกสารที่เลือก
        </div>
        <h3 className="mt-3 break-words text-headline-md text-on-surface">{selectedDocument.filename}</h3>
        <p className="mt-3 break-words text-body-md text-on-surface-variant">{selectedDocument.summary}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className={linkClassName} href="/documents">
            ดูสรุปเอกสาร
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link className={linkClassName} href={`/quiz?documentId=${selectedDocumentQuery}`}>
            สร้างควิซจากคำตอบนี้
            <Bot aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </Card>

      <Card>
        <h3 className="break-words text-headline-md text-on-surface">{chat.summaryPanel.title}</h3>
        <p className="mt-3 break-words text-body-md text-on-surface-variant">{chat.summaryPanel.summary}</p>
        <div className="mt-4 grid gap-3">
          {chat.summaryPanel.takeaways.map((takeaway) => (
            <div className="rounded border border-outline-variant/40 bg-[#fbfcff] p-3 text-body-md text-on-surface" key={takeaway}>
              {takeaway}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="break-words text-headline-md text-on-surface">คำถามต่อยอด</h3>
        <div className="mt-4 grid gap-2">
          {chat.suggestedPrompts.map((prompt) => (
            <div className="rounded bg-surface-container-low p-3 text-body-md text-on-surface-variant break-words" key={prompt.id}>
              {prompt.prompt}
            </div>
          ))}
        </div>
      </Card>
    </aside>
  );
};

const ChatComposer = ({
  errorMessage,
  onSubmit,
  selectedDocument,
  status
}: {
  errorMessage?: string;
  onSubmit: (prompt: string) => Promise<boolean>;
  selectedDocument: ChatDocument;
  status: "idle" | "submitting" | "success" | "error";
}) => {
  const [prompt, setPrompt] = useState("");
  const trimmedPrompt = prompt.trim();
  const isSubmitting = status === "submitting";

  const handleSubmit = async () => {
    if (!trimmedPrompt || isSubmitting) {
      return;
    }

    const submitted = await onSubmit(trimmedPrompt);

    if (submitted) {
      setPrompt("");
    }
  };

  return (
    <Card className="min-w-0 overflow-hidden p-4">
      <label className="text-label-sm font-bold text-on-surface" htmlFor="ai-chat-question">
        คำถามถึง AI Tutor
      </label>
      <p className="mt-2 break-words text-label-sm font-semibold text-on-surface-variant">
        ใช้เอกสาร: {selectedDocument.filename}
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <textarea
          aria-label="คำถามถึง AI Tutor"
          className="min-h-24 min-w-0 resize-none rounded border border-outline-variant/60 bg-surface-container-low px-4 py-3 text-body-md text-on-surface"
          disabled={isSubmitting}
          id="ai-chat-question"
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="คำถามเกี่ยวกับเอกสารที่เลือก"
          value={prompt}
        />
        <Button className="self-end" disabled={!trimmedPrompt || isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? "กำลังส่งคำถาม" : "ส่งคำถาม"}
          <Send aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
      {status === "success" ? (
        <div
          className="mt-4 rounded border border-[#b8dfc8] bg-[#effaf3] p-3 text-body-md font-semibold text-[#216148]"
          role="status"
        >
          ส่งคำถามถึง AI สำเร็จ
        </div>
      ) : null}
      {status === "error" && errorMessage ? (
        <div
          className="mt-4 rounded border border-[#f2b8b5] bg-[#fff8f7] p-3 text-body-md font-semibold text-[#8c1d18]"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}
    </Card>
  );
};

export const AiChatSummaryPage = ({
  chat = aiChatSummaryMock,
  dataSource = "api-ready-mock",
  errorMessage = "ไม่สามารถโหลดบทสนทนา AI ได้",
  selectedDocumentId,
  status = "ready"
}: AiChatSummaryPageProps) => {
  const [messages, setMessages] = useState(chat.messages);
  const [queryError, setQueryError] = useState<string>();
  const [queryStatus, setQueryStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  if (status === "loading") {
    return (
      <Card className="text-body-md text-on-surface-variant" role="status">
        กำลังโหลดบทสนทนา AI
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

  const sortedDocuments = sortChatDocumentsByAvailability(chat.documents);
  const selectedDocument = getSelectedChatDocument(sortedDocuments, selectedDocumentId ?? chat.selectedDocumentId);

  if (!selectedDocument) {
    return (
      <div className="space-y-6" data-source={dataSource} data-testid="ai-chat-summary">
        <Card className="text-center" role="status">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded bg-surface-container text-primary">
            <TriangleAlert aria-hidden="true" className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-headline-md text-on-surface">ยังไม่มีเอกสารที่พร้อมให้ถาม AI</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            รอเอกสารที่มีสรุปพร้อมใช้งานก่อนเริ่มบทสนทนาแบบอ้างอิงหลักฐาน
          </p>
        </Card>
      </div>
    );
  }

  const activeChat: AiChatSummaryViewModel = {
    ...chat,
    messages
  };

  const handleSubmitQuestion = async (prompt: string) => {
    setQueryError(undefined);
    setQueryStatus("submitting");

    const result = await submitDocumentChatQuestion({
      fileId: selectedDocument.id,
      prompt
    });

    if (!result.ok) {
      setQueryError(result.message);
      setQueryStatus("error");
      return false;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      ...toDocumentContextChatMessages({
        document: {
          filename: selectedDocument.filename,
          id: selectedDocument.id
        },
        prompt,
        response: result.chat
      })
    ]);
    setQueryStatus("success");
    return true;
  };

  return (
    <div className="space-y-6" data-source={dataSource} data-testid="ai-chat-summary">
      <section className="overflow-hidden rounded border border-[#2d5f72]/15 bg-[#183642] text-white shadow-ambient">
        <div className="p-5 md:p-7">
          <div className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 text-label-sm font-semibold text-[#ffd37a]">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            {chat.workspaceName}
          </div>
          <h2 className="mt-5 text-headline-lg-mobile font-bold md:text-headline-lg">แชท AI กับเอกสาร</h2>
          <p className="mt-3 max-w-3xl text-body-md text-white/80 md:text-body-lg">
            ถามต่อจากสรุปเอกสาร ดูคำตอบพร้อม citation และเตรียมต่อยอดไปควิซจากหลักฐานเดียวกัน
          </p>
        </div>
      </section>

      <section aria-label="ตัวชี้วัดบทสนทนา AI" className="grid gap-4 md:grid-cols-3">
        {chat.metrics.map((metric) => (
          <Card key={metric.id}>
            <p className="text-label-sm font-semibold uppercase text-on-surface-variant">{metric.label}</p>
            <p className="mt-2 text-display-lg font-bold text-on-surface">{metric.value}</p>
            <p className="mt-3 text-body-md text-on-surface-variant">{metric.helper}</p>
          </Card>
        ))}
      </section>

      <section
        className="grid items-start gap-4 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)_minmax(0,320px)] 2xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)_minmax(0,360px)]"
        data-testid="ai-chat-workspace-grid"
      >
        <DocumentSelector documents={sortedDocuments} selectedDocument={selectedDocument} />
        <div className="grid min-w-0 gap-4 overflow-hidden" data-testid="ai-chat-thread-column">
          <ChatThread messages={activeChat.messages} />
          <ChatComposer
            errorMessage={queryError}
            onSubmit={handleSubmitQuestion}
            selectedDocument={selectedDocument}
            status={queryStatus}
          />
        </div>
        <SummaryPanel chat={activeChat} selectedDocument={selectedDocument} />
      </section>
    </div>
  );
};
