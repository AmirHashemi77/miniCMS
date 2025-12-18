import type { Descendant } from "slate";

export type Article = {
  id: string;
  title: string;
  summary: string;
  image: string | null;
  value: Descendant[];
  html: string;
  createdAt: string;
  updatedAt: string;
};
