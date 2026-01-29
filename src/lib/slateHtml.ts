import { Element as SlateElement, Text } from "slate";
import type { Descendant } from "slate";
import type { Align } from "../slate";

function escapeHtml(text: string) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function sanitizeUrl(raw: string) {
  const url = raw.trim();
  const lower = url.toLowerCase();
  if (!url) return "#";
  if (lower.startsWith("http://") || lower.startsWith("https://")) return url;
  if (lower.startsWith("mailto:") || lower.startsWith("tel:")) return url;
  return "#";
}

function classAttr(...classes: Array<string | undefined | false>) {
  const value = classes.filter(Boolean).join(" ").trim();
  if (!value) return "";
  return ` class="${escapeHtml(value)}"`;
}

function serializeText(node: Text) {
  let html = escapeHtml(node.text);

  if (node.code) html = `<code${classAttr("rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.95em] text-slate-700 ring-1 ring-inset ring-slate-200")}>${html}</code>`;
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
    return `<a href="${href}"${classAttr(
      "text-primary underline decoration-slate-300 underline-offset-4 hover:text-primary hover:decoration-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white font-bold",
    )}>${children}</a>`;
  }

  const align: Align | undefined = "align" in node ? (node.align as Align | undefined) : undefined;
  const alignClass = align === "left" ? "text-left" : align === "center" ? "text-center" : align === "right" ? "text-right" : "text-right";

  const nodeType = (node as { type: string }).type;
  switch (nodeType) {
    case "paragraph":
      return `<p${classAttr("my-4 text-[0.8rem] !leading-9 text-slate-700 ", alignClass)}>${children || "<br />"}</p>`;
    case "heading-two":
      return `<h2${classAttr("mt-16 scroll-mt-24 text-3xl font-bold !leading-tight tracking-tight text-primary  sm:text-3xl", alignClass)}>${children}</h2>`;
    case "heading-three":
      return `<h3${classAttr("mt-8 scroll-mt-24 text-xl font-semibold !leading-snug tracking-tight text-primary sm:text-2xl", alignClass)}>${children}</h3>`;
    case "heading-one":
      return `<h2${classAttr("mt-16 scroll-mt-24 text-3xl font-bold !leading-tight tracking-tight text-primary sm:text-3xl", alignClass)}>${children}</h2>`;
    case "block-quote":
      return `<blockquote${classAttr("my-6 rounded-xl border-r-4 border-primary bg-slate-50 px-4 py-3 text-[0.8rem] italic !leading-9 text-slate-700 ", alignClass)}>${children}</blockquote>`;
    case "bulleted-list":
      return `<ul${classAttr("my-6 list-disc space-y-2 pr-6 text-[0.8rem] !leading-10 text-slate-700 marker:text-slate-400", alignClass)}>${children}</ul>`;
    case "numbered-list":
      return `<ol${classAttr("my-6 list-decimal space-y-2 pr-6 text-[0.8rem] !leading-10 text-slate-700 marker:text-slate-400", alignClass)}>${children}</ol>`;
    case "list-item":
      return `<li${classAttr("!leading-9")}>${children}</li>`;
    case "code-block":
      return `<pre${classAttr("my-6 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm !leading-6 text-slate-700 sm:text-[0.8rem]")}><code>${escapeHtml(
        node.children.map((n) => (Text.isText(n) ? n.text : "")).join("\n"),
      )}</code></pre>`;
    default:
      return `<p${classAttr("my-4 text-[0.8rem] !leading-9 text-slate-700 ", alignClass)}>${children}</p>`;
  }
}

export function slateToHtml(value: Descendant[]) {
  return value.map(serializeNode).join("");
}
