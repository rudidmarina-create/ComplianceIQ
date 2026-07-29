/** Auth module configuration placeholder */
export const authConfig = {
  /** Cookie name for the session token */
  sessionCookieName: "ciq-session",
  /** Session max age in seconds (7 days) */
  sessionMaxAge: 60 * 60 * 24 * 7,
  /** Minimum password length */
  minPasswordLength: 8,
} as const;
