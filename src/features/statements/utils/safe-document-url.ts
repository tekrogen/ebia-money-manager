/** True when the URL is safe to render as an href (http/https only). */
export function isSafeDocumentUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
