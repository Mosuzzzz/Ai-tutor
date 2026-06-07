import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

const routerBack = vi.fn();
const routerForward = vi.fn();
const routerPrefetch = vi.fn();
const routerPush = vi.fn();
const routerRefresh = vi.fn();
const routerReplace = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn((href: string) => {
    throw new Error(`NEXT_REDIRECT:${href}`);
  }),
  usePathname: () => "/",
  useRouter: () => ({
    back: routerBack,
    forward: routerForward,
    prefetch: routerPrefetch,
    push: routerPush,
    refresh: routerRefresh,
    replace: routerReplace
  })
}));
