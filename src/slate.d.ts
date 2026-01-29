import type { BaseEditor } from "slate";
import type { HistoryEditor } from "slate-history";
import type { ReactEditor } from "slate-react";

export type BulletedListElement = { type: "bulleted-list"; children: ListItemElement[] };
export type NumberedListElement = { type: "numbered-list"; children: ListItemElement[] };
export type ListItemElement = { type: "list-item"; children: CustomText[] };
export type CodeBlockElement = { type: "code-block"; children: CustomText[] };
export type LinkElement = { type: "link"; url: string; children: CustomText[] };
export type ImageElement = {
  type: "image";
  url: string;
  alt?: string;
  width?: number;
  align?: Align;
  children: CustomText[];
};

export type Align = "left" | "center" | "right";
export type AlignableElement = {
  align?: Align;
};

export type ParagraphElement = { type: "paragraph"; children: CustomText[] } & AlignableElement;
export type HeadingTwoElement = { type: "heading-two"; children: CustomText[] } & AlignableElement;
export type HeadingThreeElement = { type: "heading-three"; children: CustomText[] } & AlignableElement;
export type BlockQuoteElement = { type: "block-quote"; children: CustomText[] } & AlignableElement;

export type CustomElement =
  | ParagraphElement
  | HeadingTwoElement
  | HeadingThreeElement
  | BlockQuoteElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | CodeBlockElement
  | LinkElement
  | ImageElement;

export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
