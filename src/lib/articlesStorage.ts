import type { Descendant } from "slate";
import type { Article } from "../types/article";
import type { ParagraphElement } from "../slate";
import type { Align } from "../slate";

const STORAGE_KEY = "mini-cms:articles:v1";

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const DEFAULT_SLATE_VALUE: Descendant[] = [
  {
    type: "paragraph",
    align: "right" satisfies Align,
    children: [{ text: "" }],
  } satisfies ParagraphElement,
];

export function listArticles(): Article[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = safeJsonParse<Article[]>(raw);
  if (!parsed || !Array.isArray(parsed)) return [];

  const normalized = parsed
    .filter((a) => a && typeof a.id === "string")
    .map((a) => {
      const anyA = a as Partial<Article> & Record<string, unknown>;
      return {
        id: String(anyA.id),
        title: typeof anyA.title === "string" ? anyA.title : "",
        summary: typeof anyA.summary === "string" ? anyA.summary : "",
        image: typeof anyA.image === "string" ? anyA.image : null,
        value: Array.isArray(anyA.value) ? (anyA.value as Descendant[]) : DEFAULT_SLATE_VALUE,
        html: typeof anyA.html === "string" ? anyA.html : "",
        createdAt: typeof anyA.createdAt === "string" ? anyA.createdAt : nowIso(),
        updatedAt: typeof anyA.updatedAt === "string" ? anyA.updatedAt : nowIso(),
      } satisfies Article;
    });

  return normalized.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getArticle(id: string): Article | null {
  const articles = listArticles();
  return articles.find((a) => a.id === id) ?? null;
}

export function createArticle(input: {
  title: string;
  summary: string;
  image: string | null;
  value: Descendant[];
  html: string;
}): Article {
  const createdAt = nowIso();
  const article: Article = {
    id: newId(),
    title: input.title.trim(),
    summary: input.summary.trim(),
    image: input.image,
    value: input.value,
    html: input.html,
    createdAt,
    updatedAt: createdAt,
  };

  const next = [article, ...listArticles()];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return article;
}

export function updateArticle(
  id: string,
  patch: Partial<Pick<Article, "title" | "summary" | "image" | "value" | "html">>,
): Article | null {
  const articles = listArticles();
  const index = articles.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const current = articles[index];
  const updated: Article = {
    ...current,
    ...patch,
    title: typeof patch.title === "string" ? patch.title.trim() : current.title,
    summary: typeof patch.summary === "string" ? patch.summary.trim() : current.summary,
    image: patch.image === null || typeof patch.image === "string" ? patch.image : current.image,
    updatedAt: nowIso(),
  };

  const next = [...articles];
  next[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return updated;
}

export function deleteArticle(id: string) {
  const articles = listArticles();
  const next = articles.filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
