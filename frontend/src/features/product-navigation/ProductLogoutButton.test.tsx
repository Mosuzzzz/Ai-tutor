import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductLogoutButton } from "./ProductLogoutButton";

const routerRefresh = vi.hoisted(() => vi.fn());
const routerReplace = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh, replace: routerReplace })
}));

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status
  });

describe("ProductLogoutButton", () => {
  beforeEach(() => {
    routerRefresh.mockReset();
    routerReplace.mockReset();
  });

  afterEach(() => vi.restoreAllMocks());

  it("announces a safe failure without navigating", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      response({ message: "Unable to log out right now", ok: false }, 503)
    );
    render(<ProductLogoutButton language="en" redirectTo="/home" />);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Unable to log out right now");
    expect(routerReplace).not.toHaveBeenCalled();
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it("prevents repeated requests while logout is pending", async () => {
    let resolveLogout: ((value: Response) => void) | undefined;
    const fetcher = vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise<Response>((resolve) => { resolveLogout = resolve; })
    );
    render(<ProductLogoutButton language="en" redirectTo="/login" />);
    const button = screen.getByRole("button", { name: "Log out" });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Logging out" })).toBeDisabled();
    resolveLogout?.(response({ message: "Logged out", ok: true }));
    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/login"));
  });
});
