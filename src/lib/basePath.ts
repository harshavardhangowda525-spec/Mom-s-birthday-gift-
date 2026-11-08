/** Prefix a public-folder path (e.g. "/images/a.webp") with the deploy base path. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBase(src: string) {
  if (!src.startsWith("/") || src.startsWith("//") || (BASE_PATH && src.startsWith(BASE_PATH + "/"))) return src;
  return `${BASE_PATH}${src}`;
}
