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
  const alignClass = align === "center" ? "text-center" : align === "left" ? "text-left" : align === "right" ? "text-right" : "text-right";

  switch (element.type) {
    case "link":
      return (
        <a
          {...attributes}
          href={sanitizeUrl(element.url)}
          className="text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-slate-950 hover:decoration-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {children}
        </a>
      );
    case "heading-two":
      return (
        <h2 {...attributes} className={["mt-10 scroll-mt-24 text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl", alignClass].join(" ")}>
          {children}
        </h2>
      );
    case "heading-three":
      return (
        <h3 {...attributes} className={["mt-8 scroll-mt-24 text-xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-2xl", alignClass].join(" ")}>
          {children}
        </h3>
      );
    case "block-quote":
      return (
        <blockquote
          {...attributes}
          className={["my-6 rounded-xl border-r-4 border-slate-300 bg-slate-50 px-4 py-3 text-[0.95rem] italic leading-7 text-slate-700 sm:text-[1.05rem] sm:leading-8", alignClass].join(" ")}
        >
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul {...attributes} className="my-6 list-disc space-y-2 pr-6 text-[0.95rem] leading-7 text-slate-900 marker:text-slate-400 sm:text-[1.05rem] sm:leading-8">
          {children}
        </ul>
      );
    case "numbered-list":
      return (
        <ol {...attributes} className="my-6 list-decimal space-y-2 pr-6 text-[0.95rem] leading-7 text-slate-900 marker:text-slate-400 sm:text-[1.05rem] sm:leading-8">
          {children}
        </ol>
      );
    case "list-item":
      return (
        <li {...attributes} className="leading-7 sm:leading-8">
          {children}
        </li>
      );
    case "code-block":
      return (
        <pre {...attributes} className="my-6 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm leading-6 text-slate-900 sm:text-[0.95rem]">
          <code>{children}</code>
        </pre>
      );
    default:
      return (
        <p {...attributes} className={["my-4 text-[0.95rem] leading-7 text-slate-900 sm:text-[1.05rem] sm:leading-8", alignClass].join(" ")}>
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
  if (leaf.code) next = <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.95em] text-slate-900 ring-1 ring-inset ring-slate-200">{next}</code>;

  return (
    <span {...attributes} className="text-inherit">
      {next}
    </span>
  );
}

export default function RichTextEditor(props: Props) {
  const editor = useMemo(() => withLinks(withHistory(withReact(createEditor()))), []);

  const renderElement = useCallback((p: RenderElementProps) => <Element {...p} />, []);
  const renderLeaf = useCallback((p: RenderLeafProps) => <Leaf {...p} />, []);

  return (
    <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-6">
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
              "rounded-xl border border-slate-200 bg-white p-4 shadow-sm focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-200",
              "overflow-auto",
              props.editorAreaClassName ?? "",
            ].join(" ")}
          >
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder="متن مقاله را بنویسید…"
              className="min-h-[320px] w-full outline-none sm:min-h-[420px]"
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
