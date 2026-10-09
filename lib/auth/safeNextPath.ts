/**
 * Strict same-origin OAuth return path, shared by browser and server.
 * Backslashes and encoded path separators cannot become external redirects.
 */
export function sanitizeKetherNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return "/profile";
  if (/[\u0000-\u001F\u007F]/.test(value) || /%(?:2f|5c|00|0a|0d)/i.test(value))
    return "/profile";

  const candidate=value.slice(0,500);
  try {
    const origin="https://kether.invalid";
    const target=new URL(candidate,origin);
    if (target.origin !== origin || !target.pathname.startsWith("/"))return "/profile";
    return candidate;
  } catch {
    return "/profile";
  }
}
