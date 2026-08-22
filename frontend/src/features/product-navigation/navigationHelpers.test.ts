import { describe, expect, it } from "vitest";
import { isActiveProductHref } from "./navigationHelpers";

describe("isActiveProductHref", () => {
  it("matches exact and nested routes without matching siblings", () => {
    expect(isActiveProductHref("/documents", "/documents")).toBe(true);
    expect(isActiveProductHref("/documents/file-1", "/documents")).toBe(true);
    expect(isActiveProductHref("/documents-old", "/documents")).toBe(false);
  });
});
