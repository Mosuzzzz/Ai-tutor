import { describe, expect, it } from "vitest";

import {
  aiAction,
  getPrimaryNavigationForRole,
  primaryNavigation,
  secondaryNavigation
} from "./navigationData";
import type { AuthRouteRole } from "../auth/types";

const allRoles: AuthRouteRole[] = ["user", "admin"];
const expectedCoreHrefs = ["/", "/documents", "/chat", "/quiz", "/analytics"];

describe("app shell navigation data", () => {
  it("uses one core navigation model for every authenticated user", () => {
    expect(primaryNavigation.map((item) => item.href)).toEqual(expectedCoreHrefs);
    expect(primaryNavigation.map((item) => item.label)).toEqual([
      "แดชบอร์ด",
      "เอกสารของฉัน",
      "แชทกับเอกสาร",
      "ควิซทบทวน",
      "สถิติการทบทวน"
    ]);
  });

  it("does not expose teacher-only routes or role labels in core navigation", () => {
    const labels = primaryNavigation.map((item) => item.label);
    const hrefs = primaryNavigation.map((item) => item.href);

    expect(hrefs).not.toContain("/teacher");
    expect(labels).not.toContain("แดชบอร์ดครู");
    expect(labels).not.toContain("แดชบอร์ดนักเรียน");
  });

  it.each(allRoles)("keeps %s on the same personal study routes", (role) => {
    expect(getPrimaryNavigationForRole(role).map((item) => item.href)).toEqual(expectedCoreHrefs);
  });

  it("keeps secondary navigation and the primary action aligned with the document-first flow", () => {
    expect(secondaryNavigation.map((item) => item.href)).toEqual(["/settings"]);
    expect(aiAction).toMatchObject({
      href: "/documents",
      label: "เริ่มจากเอกสาร"
    });
  });
});
