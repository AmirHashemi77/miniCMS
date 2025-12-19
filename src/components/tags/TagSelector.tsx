import { useMemo, useState } from "react";
import { listTags } from "../../lib/tagsStorage";
import type { Tag } from "../../types/tag";

type Props = {
  selectedIds: string[];
  onChange: (next: string[]) => void;
};

export default function TagSelector(props: Props) {
  const [tags] = useState<Tag[]>(() => listTags());

  const selectedSet = useMemo(() => new Set(props.selectedIds), [props.selectedIds]);
  const selectedTags = useMemo(() => tags.filter((t) => selectedSet.has(t.id)), [tags, selectedSet]);

  return (
    <div className="rounded-2xl border border-black/5 bg-white/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">تگ‌ها</h3>
        <div className="text-xs text-foreground/60">انتخاب چندگانه</div>
      </div>

      {tags.length === 0 ? (
        <div className="mt-3 text-sm text-foreground/70">هنوز تگی ایجاد نشده است.</div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => {
              const active = selectedSet.has(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  className={[
                    "inline-flex cursor-pointer items-center justify-center rounded-full px-3 py-1 text-xs font-semibold transition",
                    active ? "bg-primary text-primary-foreground" : "bg-black/5 text-foreground hover:bg-black/10",
                  ].join(" ")}
                  onClick={() => {
                    if (active) props.onChange(props.selectedIds.filter((id) => id !== t.id));
                    else props.onChange([...props.selectedIds, t.id]);
                  }}
                >
                  {t.name}
                </button>
              );
            })}
          </div>

          {selectedTags.length ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {selectedTags.map((t) => (
                <span key={t.id} className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  {t.name}
                  <button
                    type="button"
                    className="cursor-pointer text-secondary-foreground/90 hover:text-secondary-foreground"
                    aria-label={`حذف تگ ${t.name}`}
                    onClick={() => props.onChange(props.selectedIds.filter((id) => id !== t.id))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-xs text-foreground/60">هیچ تگی انتخاب نشده است.</div>
          )}
        </>
      )}
    </div>
  );
}

