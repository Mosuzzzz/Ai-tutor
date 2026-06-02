import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("joins class names in order", () => {
    expect(cn("base", "md:flex", "text-primary")).toBe("base md:flex text-primary");
  });

  it("filters falsey class values without dropping valid strings", () => {
    expect(cn("base", false, null, undefined, "", "active")).toBe("base active");
  });
});
