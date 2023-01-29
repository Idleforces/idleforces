export const localStorageKeys = [
  "users",
  "contest",
  "archive-contest",
  "events",
  "friends",
  "books",
] as const;
export type LocalStorageKeys = typeof localStorageKeys[number];
