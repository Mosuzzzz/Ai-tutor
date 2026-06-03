export const AUTH_COOKIE_NAMES = {
  accessToken: "__Host-ai_tutor_access_token",
  refreshToken: "__Host-ai_tutor_refresh_token"
} as const;

export type AuthCookieName = (typeof AUTH_COOKIE_NAMES)[keyof typeof AUTH_COOKIE_NAMES];

export type AuthCookieOptions = {
  httpOnly: true;
  path: "/";
  sameSite: "strict";
  secure: true;
};

export type AuthCookieDescriptor = {
  maxAge: number;
  name: AuthCookieName;
  options: AuthCookieOptions;
  value: string;
};

const AUTH_COOKIE_OPTIONS: AuthCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "strict",
  secure: true
};

export const createAccessTokenCookie = (value: string, maxAge: number): AuthCookieDescriptor => {
  return createAuthCookie(AUTH_COOKIE_NAMES.accessToken, value, maxAge);
};

export const createRefreshTokenCookie = (value: string, maxAge: number): AuthCookieDescriptor => {
  return createAuthCookie(AUTH_COOKIE_NAMES.refreshToken, value, maxAge);
};

export const createExpiredAuthCookies = (): AuthCookieDescriptor[] => {
  return [
    createAuthCookie(AUTH_COOKIE_NAMES.accessToken, "", 0),
    createAuthCookie(AUTH_COOKIE_NAMES.refreshToken, "", 0)
  ];
};

export const toNextCookieOptions = (descriptor: AuthCookieDescriptor) => {
  return {
    ...descriptor.options,
    maxAge: descriptor.maxAge
  };
};

const createAuthCookie = (name: AuthCookieName, value: string, maxAge: number): AuthCookieDescriptor => {
  return {
    maxAge,
    name,
    options: AUTH_COOKIE_OPTIONS,
    value
  };
};
