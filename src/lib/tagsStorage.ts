import type { Tag } from "../types/tag";
import { listArticles, replaceAllArticles } from "./articlesStorage";

const STORAGE_KEY = "mini-cms:tags:v1";

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

function normalizeName(name: string) {
  return name.trim().replaceAll(/\s+/g, " ");
}

function normalizeNameKey(name: string) {
  return normalizeName(name).toLocaleLowerCase();
}

export function listTags(): Tag[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = safeJsonParse<Tag[]>(raw);
  if (!parsed || !Array.isArray(parsed)) return [];

  return parsed
    .filter((t) => t && typeof t.id === "string" && typeof t.name === "string")
    .map((t) => ({
      id: t.id,
      name: normalizeName(t.name),
      createdAt: typeof t.createdAt === "string" ? t.createdAt : nowIso(),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createTag(rawName: string): Tag | null {
  const name = normalizeName(rawName);
  if (!name) return null;

  const existing = listTags();
  const key = normalizeNameKey(name);
  const duplicate = existing.some((t) => normalizeNameKey(t.name) === key);
  if (duplicate) return null;

  const tag: Tag = { id: newId(), name, createdAt: nowIso() };
  const next = [tag, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return tag;
}

export function deleteTag(tagId: string) {
  const nextTags = listTags().filter((t) => t.id !== tagId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTags));

  const articles = listArticles();
  const nextArticles = articles.map((a) => ({
    ...a,
    tagIds: (a.tagIds ?? []).filter((id: string) => id !== tagId),
  }));
  replaceAllArticles(nextArticles);
}

export function countTagUsage(tagId: string) {
  return listArticles().filter((a) => (a.tagIds ?? []).includes(tagId)).length;
}
