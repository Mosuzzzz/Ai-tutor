import { describe, expect, it } from "vitest";

import {
  AUTH_COOKIE_NAMES,
  createAccessTokenCookie,
  createExpiredAuthCookies,
  createRefreshTokenCookie
} from "./authCookies";

describe("auth cookie descriptors", () => {
  it("creates HttpOnly Secure SameSite=Strict cookie descriptors for BFF route handlers", () => {
    expect(createAccessTokenCookie("access-token", 900)).toEqual({
      maxAge: 900,
      name: AUTH_COOKIE_NAMES.accessToken,
      value: "access-token",
      options: {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: true
      }
    });

    expect(createRefreshTokenCookie("refresh-token", 2592000).options).toMatchObject({
      httpOnly: true,
      sameSite: "strict",
      secure: true
    });
  });

  it("creates expired descriptors for logout without exposing token values", () => {
    expect(createExpiredAuthCookies()).toEqual([
      {
        maxAge: 0,
        name: AUTH_COOKIE_NAMES.accessToken,
        value: "",
        options: {
          httpOnly: true,
          path: "/",
          sameSite: "strict",
          secure: true
        }
      },
      {
        maxAge: 0,
        name: AUTH_COOKIE_NAMES.refreshToken,
        value: "",
        options: {
          httpOnly: true,
          path: "/",
          sameSite: "strict",
          secure: true
        }
      }
    ]);
  });
});
