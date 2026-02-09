import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

export function isLikelyHtml(content?: string | null): boolean {
  if (!content) return false;
  return HTML_TAG_PATTERN.test(content.trim());
}

export function normalizeColumnContent(content?: string | null): string {
  if (!content) {
    return "<p></p>";
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return "<p></p>";
  }

  if (isLikelyHtml(trimmed)) {
    return content;
  }

  return markdown.render(trimmed);
}
