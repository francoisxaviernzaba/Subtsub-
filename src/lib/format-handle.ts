export function formatHandle(handle: string | null): string | null {
  if (!handle) return null;
  const clean = handle.replace(/^@/, "");
  return clean ? `@${clean}` : null;
}

export function getHandle(raw: string | null): string | null {
  if (!raw) return null;
  return raw.replace(/^@/, "");
}
