import { useMemo, useState } from "react";
import type { Descendant } from "slate";
import { Node } from "slate";
import HtmlPreview from "../editor/HtmlPreview";
import RichTextEditor from "../editor/RichTextEditor";
import { slateToHtml } from "../../lib/slateHtml";
import type { ArticleStatus } from "../../types/article";
import TagSelector from "../tags/TagSelector";

type Props = {
  initialTitle: string;
  initialSummary: string;
  initialImage: string | null;
  initialTagIds: string[];
  initialValue: Descendant[];
  onSave: (data: {
    title: string;
    summary: string;
    image: string | null;
    status: ArticleStatus;
    tags: string[];
    value: Descendant[];
    html: string;
  }) => void;
};

export default function ArticleEditorForm(props: Props) {
  const [title, setTitle] = useState(props.initialTitle);
  const [summary, setSummary] = useState(props.initialSummary);
  const [image, setImage] = useState<string | null>(props.initialImage);
  const [tags, setTags] = useState<string[]>(props.initialTagIds);
  const [value, setValue] = useState<Descendant[]>(props.initialValue);
  const [error, setError] = useState<string | null>(null);

  const html = useMemo(() => slateToHtml(value), [value]);
  const isContentEmpty = useMemo(() => {
    const plain = value.map((n) => Node.string(n)).join("").trim();
    return plain.length === 0;
  }, [value]);
  const isTitleEmpty = title.trim().length === 0;
  const canPublish = !isTitleEmpty && !isContentEmpty;

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-black/5 bg-white/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="w-full lg:max-w-3xl">
            <label className="block text-sm font-semibold">عنوان مقاله</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-4"
              placeholder="مثلاً: راهنمای شروع…"
            />

            <label className="mt-4 block text-sm font-semibold">خلاصه</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm leading-6 outline-none ring-primary/30 focus:ring-4"
              rows={3}
              placeholder="خلاصه کوتاه برای نمایش در لیست…"
            />

            <div className="mt-4 grid gap-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="block text-sm font-semibold">تصویر مقاله</label>
                {image ? (
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="cursor-pointer text-xs text-foreground/70 underline hover:text-foreground"
                  >
                    حذف تصویر
                  </button>
                ) : null}
              </div>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : null);
                  reader.readAsDataURL(file);
                }}
              />
              {image ? (
                <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
                  <img src={image} alt="پیش‌نمایش تصویر مقاله" className="h-40 w-full object-cover" />
                </div>
              ) : null}
            </div>

            {error ? <div className="mt-3 text-sm text-red-700">{error}</div> : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextTitle = title.trim();
                if (!nextTitle) {
                  setError("عنوان مقاله را وارد کنید.");
                  return;
                }
              setError(null);
              props.onSave({ title: nextTitle, summary, image, status: "draft", tags, value, html });
            }}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5"
          >
            ذخیره پیش‌نویس
          </button>
            <button
              type="button"
              disabled={!canPublish}
              onClick={() => {
                const nextTitle = title.trim();
                if (!nextTitle) {
                  setError("عنوان مقاله را وارد کنید.");
                  return;
                }
                if (isContentEmpty) {
                  setError("برای انتشار، متن مقاله نباید خالی باشد.");
                  return;
                }
                setError(null);
                props.onSave({ title: nextTitle, summary, image, status: "published", tags, value, html });
              }}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              انتشار
            </button>
          </div>
        </div>
      </div>

      <TagSelector selectedIds={tags} onChange={setTags} />

      <div className="grid gap-4">
        <div>
          <h2 className="mb-2 text-sm font-semibold">ویرایشگر</h2>
          <RichTextEditor value={value} onChange={setValue} editorAreaClassName="h-[42dvh] min-h-[320px]" />
        </div>

        <div>
          <HtmlPreview html={html} className="h-[42dvh] min-h-[320px]" />
        </div>
      </div>
    </div>
  );
}
