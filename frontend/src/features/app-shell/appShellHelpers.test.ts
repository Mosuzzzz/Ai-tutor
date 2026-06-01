import { describe, expect, it } from "vitest";

import { isActiveHref } from "./appShellHelpers";

describe("app shell helpers", () => {
  it("marks the root href active only on the root pathname", () => {
    expect(isActiveHref("/", "/")).toBe(true);
    expect(isActiveHref("/documents", "/")).toBe(false);
  });

  it("marks nested route paths active without matching similarly prefixed routes", () => {
    expect(isActiveHref("/documents/summary", "/documents")).toBe(true);
    expect(isActiveHref("/documents-archive", "/documents")).toBe(false);
  });
});
