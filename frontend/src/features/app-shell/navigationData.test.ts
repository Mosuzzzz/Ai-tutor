import { describe, expect, it } from "vitest";

import { aiAction, primaryNavigation, secondaryNavigation } from "./navigationData";

describe("app shell navigation data", () => {
  it("keeps primary navigation hrefs stable for the app shell", () => {
    expect(primaryNavigation.map((item) => item.href)).toEqual([
      "/",
      "/teacher",
      "/courses",
      "/documents",
      "/chat",
      "/quiz",
      "/analytics"
    ]);
  });

  it("keeps secondary navigation and AI action ready for role-aware expansion", () => {
    expect(secondaryNavigation.map((item) => item.href)).toEqual(["/settings"]);
    expect(aiAction.label).toBe("เริ่มเรียนเลย");
  });
});
