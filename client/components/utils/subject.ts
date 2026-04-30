export const DEFAULT_SUBJECT = "general";

export const normalizeSubject = (value?: string, fallback = DEFAULT_SUBJECT) => {
  const normalized = value?.trim().toLowerCase();
  return normalized || fallback;
};
