import { useCallback, useMemo } from "react";
import type { Descendant } from "slate";
import { createEditor, Editor, Element as SlateElement } from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, withReact } from "slate-react";
import type { RenderElementProps, RenderLeafProps } from "slate-react";
import EditorToolbar from "./EditorToolbar";
import type { Align } from "../../slate";

type Props = {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  editorAreaClassName?: string;
};

const HOTKEYS: Record<string, "bold" | "italic" | "underline" | "code"> = {
  b: "bold",
  i: "italic",
  u: "underline",
  "`": "code",
};

function sanitizeUrl(raw: string) {
  const url = raw.trim();
  const lower = url.toLowerCase();
  if (!url) return "#";
  if (lower.startsWith("http://") || lower.startsWith("https://")) return url;
  if (lower.startsWith("mailto:") || lower.startsWith("tel:")) return url;
  return "#";
}

function withLinks(editor: Editor) {
  const { isInline } = editor;
  editor.isInline = (element) => {
    return (SlateElement.isElement(element) && element.type === "link") || isInline(element);
  };
  return editor;
}

function Element(props: RenderElementProps) {
  const { attributes, children, element } = props;

  const align: Align | undefined = "align" in element ? (element.align as Align | undefined) : undefined;
  const alignClass =
    align === "center" ? "text-center" : align === "left" ? "text-left" : align === "right" ? "text-right" : "text-right";

  switch (element.type) {
    case "link":
      return (
        <a {...attributes} href={sanitizeUrl(element.url)} className="text-primary underline">
          {children}
        </a>
      );
    case "heading-two":
      return (
        <h2 {...attributes} className={["my-2 text-xl font-semibold", alignClass].join(" ")}>
          {children}
        </h2>
      );
    case "heading-three":
      return (
        <h3 {...attributes} className={["my-2 text-lg font-semibold", alignClass].join(" ")}>
          {children}
        </h3>
      );
    case "block-quote":
      return (
        <blockquote
          {...attributes}
          className={["my-2 border-r-4 border-secondary/60 pr-3 text-foreground/80", alignClass].join(" ")}
        >
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul {...attributes} className="my-2 list-disc pr-6">
          {children}
        </ul>
      );
    case "numbered-list":
      return (
        <ol {...attributes} className="my-2 list-decimal pr-6">
          {children}
        </ol>
      );
    case "list-item":
      return (
        <li {...attributes} className="my-1">
          {children}
        </li>
      );
    case "code-block":
      return (
        <pre
          {...attributes}
          className="my-2 overflow-auto rounded-xl border border-black/5 bg-black/5 p-3 text-sm leading-6"
        >
          <code>{children}</code>
        </pre>
      );
    default:
      return (
        <p {...attributes} className={["my-2 leading-7", alignClass].join(" ")}>
          {children}
        </p>
      );
  }
}

function Leaf(props: RenderLeafProps) {
  const { attributes, children, leaf } = props;
  let next = children;

  if (leaf.bold) next = <strong>{next}</strong>;
  if (leaf.italic) next = <em>{next}</em>;
  if (leaf.underline) next = <u>{next}</u>;
  if (leaf.code)
    next = <code className="rounded bg-black/5 px-1 py-0.5 text-[0.95em]">{next}</code>;

  return (
    <span {...attributes} className="text-foreground">
      {next}
    </span>
  );
}

export default function RichTextEditor(props: Props) {
  const editor = useMemo(() => withLinks(withHistory(withReact(createEditor()))), []);

  const renderElement = useCallback((p: RenderElementProps) => <Element {...p} />, []);
  const renderLeaf = useCallback((p: RenderLeafProps) => <Leaf {...p} />, []);

  return (
    <div className="rounded-2xl border border-black/5 bg-white/60 p-3">
      <Slate
        editor={editor}
        initialValue={props.value}
        onChange={(nextValue) => {
          const isDocumentChange = editor.operations.some((op) => op.type !== "set_selection");
          if (isDocumentChange) props.onChange(nextValue);
        }}
      >
        <div className="flex flex-col gap-3">
          <EditorToolbar />
          <div
            className={[
              "rounded-xl border border-black/5 bg-white p-3",
              "overflow-auto",
              props.editorAreaClassName ?? "",
            ].join(" ")}
          >
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder="متن مقاله را بنویسید…"
              className="min-h-full outline-none"
              spellCheck={false}
              onKeyDown={(event) => {
                const key = event.key.toLowerCase();
                const isMod = event.metaKey || event.ctrlKey;
                if (!isMod) return;
                const mark = HOTKEYS[key];
                if (!mark) return;
                event.preventDefault();
                const marks = Editor.marks(editor) ?? {};
                const isActive = (marks as Record<string, unknown>)[mark] === true;
                if (isActive) Editor.removeMark(editor, mark);
                else Editor.addMark(editor, mark, true);
              }}
            />
          </div>
        </div>
      </Slate>
    </div>
  );
}
