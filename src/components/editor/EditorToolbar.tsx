import { Editor, Element as SlateElement, Range, Transforms } from "slate";
import { ReactEditor, useSlate } from "slate-react";
import type React from "react";
import type { Align, CustomElement } from "../../slate";

const LIST_TYPES = ["numbered-list", "bulleted-list"] as const;
type ListType = (typeof LIST_TYPES)[number];

function isListType(type: string): type is ListType {
  return (LIST_TYPES as readonly string[]).includes(type);
}

function isMarkActive(editor: Editor, mark: "bold" | "italic" | "underline" | "code") {
  const marks = Editor.marks(editor);
  return marks ? (marks as Record<string, unknown>)[mark] === true : false;
}

function toggleMark(editor: Editor, mark: "bold" | "italic" | "underline" | "code") {
  const isActive = isMarkActive(editor, mark);
  if (isActive) Editor.removeMark(editor, mark);
  else Editor.addMark(editor, mark, true);
}

function normalizeUrl(raw: string) {
  return raw.trim();
}

function isLinkActive(editor: Editor) {
  const [match] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  });
  return !!match;
}

function getActiveLinkUrl(editor: Editor) {
  const [match] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  });
  if (!match) return null;
  const [node] = match;
  if (!SlateElement.isElement(node) || node.type !== "link") return null;
  return node.url ?? null;
}

function unwrapLink(editor: Editor) {
  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
    split: true,
  });
}

function upsertLink(editor: Editor, rawUrl: string) {
  const url = normalizeUrl(rawUrl);
  const selection = editor.selection;
  if (!selection) return;

  if (isLinkActive(editor)) {
    Transforms.setNodes(
      editor,
      { url },
      {
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
      },
    );
    return;
  }

  const isCollapsed = Range.isCollapsed(selection);
  if (isCollapsed) {
    const link = { type: "link", url, children: [{ text: url }] } satisfies CustomElement;
    Transforms.insertNodes(editor, link);
  } else {
    const link = { type: "link", url, children: [] as never[] } satisfies CustomElement;
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
}

function isBlockActive(editor: Editor, blockType: string) {
  const [match] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === blockType,
  });
  return !!match;
}

function getActiveAlign(editor: Editor): Align {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n.type === "paragraph" ||
        n.type === "heading-two" ||
        n.type === "heading-three" ||
        n.type === "block-quote"),
  });

  if (!match) return "right";
  const [node] = match;
  if (!SlateElement.isElement(node)) return "right";
  const align = (node as { align?: Align }).align;
  if (align === "left" || align === "center" || align === "right") return align;
  return "right";
}

function setAlign(editor: Editor, align: Align) {
  Transforms.setNodes(
    editor,
    { align },
    {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n.type === "paragraph" ||
          n.type === "heading-two" ||
          n.type === "heading-three" ||
          n.type === "block-quote"),
    },
  );
}

function toggleBlock(editor: Editor, blockType: string) {
  const isActive = isBlockActive(editor, blockType);
  const isList = isListType(blockType);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type as (typeof LIST_TYPES)[number]),
    split: true,
  });

  const nextType: CustomElement["type"] = isActive
    ? "paragraph"
    : isList
      ? "list-item"
      : (blockType as CustomElement["type"]);
  Transforms.setNodes(editor, { type: nextType }, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n),
  });

  if (!isActive && isList) {
    const block = { type: blockType, children: [] as never[] };
    Transforms.wrapNodes(editor, block, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "list-item",
    });
  }
}

function ToolbarButton(props: {
  active?: boolean;
  onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={props.onMouseDown}
      className={[
        "inline-flex h-9 cursor-pointer items-center justify-center rounded-xl px-3 text-sm transition",
        props.active ? "bg-primary text-primary-foreground" : "bg-white/70 hover:bg-white",
        "border border-black/5",
      ].join(" ")}
    >
      {props.children}
    </button>
  );
}

export default function EditorToolbar() {
  const editor = useSlate();
  const activeAlign = getActiveAlign(editor);
  const linkActive = isLinkActive(editor);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToolbarButton
        active={isMarkActive(editor, "bold")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(editor, "bold");
        }}
      >
        B
      </ToolbarButton>
      <ToolbarButton
        active={isMarkActive(editor, "italic")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(editor, "italic");
        }}
      >
        I
      </ToolbarButton>
      <ToolbarButton
        active={isMarkActive(editor, "underline")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(editor, "underline");
        }}
      >
        U
      </ToolbarButton>
      <ToolbarButton
        active={isMarkActive(editor, "code")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(editor, "code");
        }}
      >
        Code
      </ToolbarButton>
      <ToolbarButton
        active={linkActive}
        onMouseDown={(e) => {
          e.preventDefault();
          ReactEditor.focus(editor);
          const current = getActiveLinkUrl(editor) ?? "https://";
          const next = window.prompt("آدرس لینک را وارد کنید:", current);
          if (next === null) return;
          if (!next.trim()) {
            unwrapLink(editor);
            return;
          }
          upsertLink(editor, next);
        }}
      >
        لینک
      </ToolbarButton>
      <ToolbarButton
        active={false}
        onMouseDown={(e) => {
          e.preventDefault();
          ReactEditor.focus(editor);
          unwrapLink(editor);
        }}
      >
        حذف لینک
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-black/10" aria-hidden="true" />

      <ToolbarButton
        active={isBlockActive(editor, "heading-two")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleBlock(editor, "heading-two");
        }}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        active={isBlockActive(editor, "heading-three")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleBlock(editor, "heading-three");
        }}
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        active={isBlockActive(editor, "block-quote")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleBlock(editor, "block-quote");
        }}
      >
        نقل‌قول
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-black/10" aria-hidden="true" />

      <label className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white/60 px-3 py-2 text-sm">
        <span className="text-foreground/70">تراز</span>
        <select
          value={activeAlign}
          onChange={(e) => setAlign(editor, e.target.value as Align)}
          className="cursor-pointer bg-transparent text-sm outline-none"
          aria-label="تراز متن"
        >
          <option className="cursor-pointer" value="right">
            راست
          </option>
          <option className="cursor-pointer" value="center">
            وسط
          </option>
          <option className="cursor-pointer" value="left">
            چپ
          </option>
        </select>
      </label>
      <ToolbarButton
        active={isBlockActive(editor, "bulleted-list")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleBlock(editor, "bulleted-list");
        }}
      >
        لیست
      </ToolbarButton>
      <ToolbarButton
        active={isBlockActive(editor, "numbered-list")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleBlock(editor, "numbered-list");
        }}
      >
        شماره‌دار
      </ToolbarButton>
      <ToolbarButton
        active={isBlockActive(editor, "code-block")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleBlock(editor, "code-block");
        }}
      >
        Code Block
      </ToolbarButton>
    </div>
  );
}
