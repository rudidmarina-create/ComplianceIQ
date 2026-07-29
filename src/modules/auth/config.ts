/** Auth module configuration */
export const authConfig = {
  /** Session max age in seconds (7 days) */
  sessionMaxAge: 60 * 60 * 24 * 7,
  /** Minimum password length */
  minPasswordLength: 8,
  /** bcrypt salt rounds */
  bcryptRounds: 10,
} as const;
