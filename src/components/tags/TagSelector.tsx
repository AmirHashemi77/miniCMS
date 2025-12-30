import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getTagsListService } from "../../services/tag.services";
import type { Tag } from "../../types/tag";

type Props = {
  selectedIds: string[];
  onChange: (next: string[]) => void;
};

export default function TagSelector(props: Props) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isMountedRef = useRef(true);

  const page = 1;
  const limit = 200;

  const fetchTags = useCallback(async () => {
    if (!isMountedRef.current) return;
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await getTagsListService(page, limit);
      const data = response.data as unknown;
      const next = Array.isArray(data) ? (data as Tag[]) : (((data as any)?.items ?? (data as any)?.data ?? []) as Tag[]);
      if (!isMountedRef.current) return;
      setTags(next);
    } catch {
      if (!isMountedRef.current) return;
      setHasError(true);
      setTags([]);
    } finally {
      if (!isMountedRef.current) return;
      setIsLoading(false);
    }
  }, [limit, page]);

  useEffect(() => {
    isMountedRef.current = true;
    void fetchTags();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchTags]);

  const selectedSet = useMemo(() => new Set(props.selectedIds), [props.selectedIds]);
  const selectedTags = useMemo(() => tags.filter((t) => selectedSet.has(t.id)), [tags, selectedSet]);

  return (
    <div className="rounded-2xl border border-black/5 bg-white/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">تگ‌ها</h3>
        <div className="flex items-center gap-2">
          <div className="text-xs text-foreground/60">انتخاب چندگانه</div>
          <button type="button" onClick={() => void fetchTags()} className="text-xs text-primary underline hover:opacity-80">
            بروزرسانی
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-3 text-sm text-foreground/70">در حال دریافت تگ‌ها...</div>
      ) : hasError ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <div>خطا در دریافت لیست تگ‌ها</div>
          <button type="button" onClick={() => void fetchTags()} className="text-xs underline">
            تلاش مجدد
          </button>
        </div>
      ) : tags.length === 0 ? (
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
