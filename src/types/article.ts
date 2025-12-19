import type { Descendant } from "slate";

export type ArticleStatus = "draft" | "published";

export type Article = {
  id: string;
  title: string;
  summary: string;
  image: string | null;
  status: ArticleStatus;
  tags: string[];
  value: Descendant[];
  html: string;
  createdAt: string;
  updatedAt: string;
};
