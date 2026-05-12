/** Academic session read from NEXT_PUBLIC_CURRENT_SESSION env var. */
export const CURRENT_SESSION: string =
  process.env.NEXT_PUBLIC_CURRENT_SESSION ?? '2026-27';
