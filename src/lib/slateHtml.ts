import { Element as SlateElement, Text } from "slate";
import type { Descendant } from "slate";
import type { Align } from "../slate";

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizeUrl(raw: string) {
  const url = raw.trim();
  const lower = url.toLowerCase();
  if (!url) return "#";
  if (lower.startsWith("http://") || lower.startsWith("https://")) return url;
  if (lower.startsWith("mailto:") || lower.startsWith("tel:")) return url;
  return "#";
}

function serializeText(node: Text) {
  let html = escapeHtml(node.text);

  if (node.code) html = `<code>${html}</code>`;
  if (node.bold) html = `<strong>${html}</strong>`;
  if (node.italic) html = `<em>${html}</em>`;
  if (node.underline) html = `<u>${html}</u>`;

  return html;
}

function serializeNode(node: Descendant): string {
  if (Text.isText(node)) return serializeText(node);
  if (!SlateElement.isElement(node)) return "";

  const children = node.children.map(serializeNode).join("");

  if (node.type === "link") {
    const href = escapeHtml(sanitizeUrl(node.url ?? ""));
    return `<a href="${href}" class="text-primary underline">${children}</a>`;
  }

  const align: Align | undefined = "align" in node ? (node.align as Align | undefined) : undefined;
  const alignClass =
    align === "left" ? "text-left" : align === "center" ? "text-center" : align === "right" ? "text-right" : "text-right";
  const alignAttr = ` class="${alignClass}"`;

  const nodeType = (node as { type: string }).type;
  switch (nodeType) {
    case "paragraph":
      return `<p${alignAttr}>${children || "<br />"}</p>`;
    case "heading-two":
      return `<h2${alignAttr}>${children}</h2>`;
    case "heading-three":
      return `<h3${alignAttr}>${children}</h3>`;
    case "heading-one":
      return `<h2${alignAttr}>${children}</h2>`;
    case "block-quote":
      return `<blockquote${alignAttr}>${children}</blockquote>`;
    case "bulleted-list":
      return `<ul>${children}</ul>`;
    case "numbered-list":
      return `<ol>${children}</ol>`;
    case "list-item":
      return `<li>${children}</li>`;
    case "code-block":
      return `<pre><code>${escapeHtml(
        node.children.map((n) => (Text.isText(n) ? n.text : "")).join("\n"),
      )}</code></pre>`;
    default:
      return `<p>${children}</p>`;
  }
}

export function slateToHtml(value: Descendant[]) {
  return value.map(serializeNode).join("");
}
