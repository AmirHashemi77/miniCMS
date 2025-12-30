import { useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import type { Article } from "../../types/article";
import type { Tag } from "../../types/tag";
import { getAticlesListService } from "../../services/article.services";
import { createTagService, deleteTagService, getTagsListService } from "../../services/tag.services";

export default function TagsList() {
  const { enqueueSnackbar } = useSnackbar();
  const [name, setName] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const page = 1;
  const limit = 200;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tagsRes, articlesRes] = await Promise.all([getTagsListService(page, limit), getAticlesListService(1, 100)]);

      const tagsData = tagsRes.data as unknown;
      const nextTags = Array.isArray(tagsData) ? (tagsData as Tag[]) : (((tagsData as any)?.items ?? (tagsData as any)?.data ?? []) as Tag[]);
      setTags(nextTags);

      const articlesData = articlesRes.data as unknown;
      const nextArticles = Array.isArray(articlesData) ? (articlesData as Article[]) : (((articlesData as any)?.items ?? (articlesData as any)?.data ?? []) as Article[]);
      setArticles(nextArticles);
    } catch {
      enqueueSnackbar("خطا در دریافت اطلاعات تگ‌ها", { variant: "error" });
      setTags([]);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usageById = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of articles) {
      for (const tagId of a.tagIds ?? []) {
        map.set(tagId, (map.get(tagId) ?? 0) + 1);
      }
    }
    return map;
  }, [articles]);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-lg font-semibold">تگ‌ها</h1>
        <p className="mt-1 text-sm text-foreground/70">مدیریت تگ‌ها و میزان استفاده در مقالات</p>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/60 p-4">
        <label className="block text-sm font-semibold">ایجاد تگ جدید</label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-4"
            placeholder="مثلاً: زوج درمانی"
          />
          <button
            type="button"
            disabled={isSubmitting || isLoading}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              const nextName = name.trim();
              if (!nextName) return;

              void (async () => {
                setIsSubmitting(true);
                try {
                  await createTagService({ name: nextName });
                  enqueueSnackbar("تگ ایجاد شد", { variant: "success" });
                  setName("");
                  await fetchData();
                } catch {
                  enqueueSnackbar("خطا در ایجاد تگ", { variant: "error" });
                } finally {
                  setIsSubmitting(false);
                }
              })();
            }}
          >
            {isSubmitting ? "در حال افزودن..." : "افزودن"}
          </button>
        </div>
        <div className="mt-2 text-xs text-foreground/70">نام تکراری پذیرفته نمی‌شود.</div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-black/5 bg-white/60 p-6 text-sm text-foreground/70">در حال دریافت تگ‌ها...</div>
      ) : tags.length === 0 ? (
        <div className="rounded-2xl border border-black/5 bg-white/60 p-6 text-sm text-foreground/70">هنوز تگی ندارید.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white/60">
          <div className="grid grid-cols-12 gap-3 border-b border-black/5 px-4 py-3 text-xs text-foreground/70">
            <div className="col-span-8">نام</div>
            <div className="col-span-2">استفاده</div>
            <div className="col-span-2 text-left">عملیات</div>
          </div>
          <ul className="divide-y divide-black/5">
            {tags.map((t) => {
              const count = usageById.get(t.id) ?? 0;
              return (
                <li key={t.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3">
                  <div className="col-span-8 truncate text-sm font-medium">{t.name}</div>
                  <div className="col-span-2 text-xs text-foreground/70">{count}</div>
                  <div className="col-span-2 flex justify-start">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => {
                        const ok = window.confirm("این تگ حذف شود؟");
                        if (!ok) return;

                        void (async () => {
                          setIsSubmitting(true);
                          try {
                            await deleteTagService(t.id);
                            enqueueSnackbar("تگ حذف شد", { variant: "success" });
                            await fetchData();
                          } catch {
                            enqueueSnackbar("خطا در حذف تگ", { variant: "error" });
                          } finally {
                            setIsSubmitting(false);
                          }
                        })();
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
