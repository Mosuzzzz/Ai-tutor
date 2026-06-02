import { describe, expect, it } from "vitest";

import {
  getPlaceholderModule,
  placeholderModuleKeys,
  placeholderModules
} from "./placeholderContent";

describe("placeholder content", () => {
  it("keeps placeholder modules limited to routes that are still waiting for real features", () => {
    expect(placeholderModuleKeys).toEqual(["courses", "settings"]);
  });

  it("defines route metadata, display copy, and readiness notes for each placeholder module", () => {
    for (const key of placeholderModuleKeys) {
      const placeholder = placeholderModules[key];

      expect(placeholder.key).toBe(key);
      expect(placeholder.href).toMatch(/^\/[a-z]+$/);
      expect(placeholder.title.length).toBeGreaterThan(0);
      expect(placeholder.description.length).toBeGreaterThan(24);
      expect(placeholder.statusLabel).toBe("Foundation ready");
      expect(placeholder.handoffNote).toContain("feature");
      expect(placeholder.readinessItems).toHaveLength(3);
      expect(placeholder.icon).toBeDefined();
    }
  });

  it("returns the requested module with a stable API-ready shape", () => {
    expect(getPlaceholderModule("courses")).toMatchObject({
      href: "/courses",
      key: "courses",
      title: "คอร์สเรียน"
    });
  });
});
