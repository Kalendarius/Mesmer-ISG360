const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Kullanıcı tarafından girilebilen metinleri (işletme adı, bulgu başlığı vb.)
 * HTML e-posta gövdelerine gömmeden önce escape eder — aksi halde bir
 * işletme adına veya bulgu başlığına yazılan HTML/script içeriği e-postaya
 * enjekte edilebilir.
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
