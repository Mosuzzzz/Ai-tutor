import { describe, expect, it } from "vitest";

import {
  buildDocumentDetailHref,
  countAvailableSummaries,
  formatDocumentStatus,
  getSelectedDocument,
  getRecentDocuments,
  normalizeDocumentRouteId,
  parseSummaryMarkdown,
  sortDocumentsByLatestUpload,
  sortDocumentsByReadiness
} from "./documentSummaryHelpers";
import type { DocumentLibraryItem } from "./types";

const documents: DocumentLibraryItem[] = [
  {
    created_at: "2026-05-30T08:30:00.000Z",
    filename: "processing-guide.pdf",
    id: "doc-processing",
    related_exams_count: 0,
    status: "processing",
    summary_available: false,
    summary_markdown: null
  },
  {
    created_at: "2026-05-31T09:00:00.000Z",
    filename: "ready-latest.pdf",
    id: "doc-ready-latest",
    related_exams_count: 2,
    status: "ready",
    summary_available: true,
    summary_markdown: "## Overview\nLatest document"
  },
  {
    created_at: "2026-05-29T07:00:00.000Z",
    filename: "ready-old.pdf",
    id: "doc-ready-old",
    related_exams_count: 1,
    status: "ready",
    summary_available: true,
    summary_markdown: "## Overview\nOlder document"
  },
  {
    created_at: "2026-05-28T07:00:00.000Z",
    filename: "failed.pdf",
    id: "doc-error",
    related_exams_count: 0,
    status: "error",
    summary_available: false,
    summary_markdown: null
  }
];

describe("document summary helpers", () => {
  it("formats backend document statuses into Thai labels", () => {
    expect(formatDocumentStatus("ready")).toBe("พร้อมสรุป");
    expect(formatDocumentStatus("processing")).toBe("กำลังประมวลผล");
    expect(formatDocumentStatus("pending")).toBe("รอประมวลผล");
    expect(formatDocumentStatus("error")).toBe("มีปัญหา");
  });

  it("counts documents that already have generated summaries", () => {
    expect(countAvailableSummaries(documents)).toBe(2);
  });

  it("sorts ready summaries first and then by newest upload date", () => {
    expect(sortDocumentsByReadiness(documents).map((document) => document.id)).toEqual([
      "doc-ready-latest",
      "doc-ready-old",
      "doc-processing",
      "doc-error"
    ]);
  });

  it("sorts documents by latest upload date and keeps unsafe dates last", () => {
    expect(
      sortDocumentsByLatestUpload([
        ...documents,
        {
          ...documents[0],
          created_at: "not-a-date",
          id: "doc-invalid-date"
        }
      ]).map((document) => document.id)
    ).toEqual(["doc-ready-latest", "doc-processing", "doc-ready-old", "doc-error", "doc-invalid-date"]);
  });

  it("returns a bounded latest document preview for the personal library", () => {
    expect(getRecentDocuments(documents, 2).map((document) => document.id)).toEqual([
      "doc-ready-latest",
      "doc-processing"
    ]);
    expect(getRecentDocuments(documents, 0)).toEqual([]);
  });

  it("selects a requested document or falls back to the first ready summary", () => {
    expect(getSelectedDocument(documents, "doc-ready-old")?.id).toBe("doc-ready-old");
    expect(getSelectedDocument(documents, "missing-id")?.id).toBe("doc-ready-latest");
  });

  it("builds safe document detail links without exposing backend endpoints", () => {
    expect(buildDocumentDetailHref("file-ready")).toBe("/documents/file-ready");
    expect(buildDocumentDetailHref("file ready")).toBe("/documents/file%20ready");
    expect(buildDocumentDetailHref("/api/files/file-ready/detail")).toBe("/documents/%2Fapi%2Ffiles%2Ffile-ready%2Fdetail");
  });

  it("normalizes route file ids and rejects unsafe path-like values", () => {
    expect(normalizeDocumentRouteId(" file-ready ")).toBe("file-ready");
    expect(normalizeDocumentRouteId("")).toBeUndefined();
    expect(normalizeDocumentRouteId("..")).toBeUndefined();
    expect(normalizeDocumentRouteId("../file-ready")).toBeUndefined();
    expect(normalizeDocumentRouteId("folder\\file-ready")).toBeUndefined();
    expect(normalizeDocumentRouteId("x".repeat(201))).toBeUndefined();
  });

  it("parses markdown headings into safe text sections without rendering HTML", () => {
    const sections = parseSummaryMarkdown(
      "## Overview\nTraining guide <script>alert('x')</script>\n\n## Key Controls\n- Verify access\n- Record activity"
    );

    expect(sections).toEqual([
      {
        body: "Training guide <script>alert('x')</script>",
        id: "overview",
        title: "Overview"
      },
      {
        body: "Verify access\nRecord activity",
        id: "key-controls",
        title: "Key Controls"
      }
    ]);
  });
});
