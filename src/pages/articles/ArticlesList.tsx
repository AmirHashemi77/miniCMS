import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Node } from "slate";
import { formatFaDate } from "../../lib/dates";
import { changeStatusAticleService, deleteAticlesService, getAticlesListService } from "../../services/article.services";
import type { Article } from "../../types/article";

function EmptyState() {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/60 p-6">
      <h2 className="text-base text-center font-semibold">هنوز مقاله‌ای ندارید</h2>
      <p className="mt-2 text-sm text-center text-foreground/70">برای شروع یک مقاله جدید ایجاد کنید.</p>
    </div>
  );
}

export default function ArticlesList() {
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutatingId, setIsMutatingId] = useState<string | null>(null);

  useEffect(() => {
    let isStale = false;

    const run = async () => {
      setIsLoading(true);
      try {
        const response = await getAticlesListService(page, limit);
        const data = response.data as unknown;
        const next = Array.isArray(data) ? (data as Article[]) : (((data as any)?.items ?? (data as any)?.data ?? []) as Article[]);
        if (!isStale) setArticles(next);
      } catch {
        enqueueSnackbar("خطا در دریافت لیست مقالات", { variant: "error" });
        if (!isStale) setArticles([]);
      } finally {
        if (!isStale) setIsLoading(false);
      }
    };

    void run();
    return () => {
      isStale = true;
    };
  }, [enqueueSnackbar, limit, page]);

  const rows = useMemo(() => {
    return articles.map((a) => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      image: a.image,
      status: a.status,
      canPublish: (() => {
        if (!a.title || a.title.trim().length === 0) return false;
        try {
          const value = (a as any).value;
          if (!Array.isArray(value)) return false;
          return Node.string({ children: value } as unknown as Node).trim().length > 0;
        } catch {
          return false;
        }
      })(),
      createdAt: formatFaDate(a.createdAt),
    }));
  }, [articles]);

  const onChangeStatus = async (id: string, nextStatus: "draft" | "published") => {
    const current = articles.find((a) => a.id === id);
    if (!current) return;

    setIsMutatingId(id);
    try {
      const response = await changeStatusAticleService(id);
      const updated = (response.data as unknown) as Article | null;
      setArticles((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          if (updated && updated.id) return updated;
          return { ...a, status: nextStatus };
        })
      );
      enqueueSnackbar(nextStatus === "published" ? "مقاله منتشر شد" : "مقاله از انتشار خارج شد", { variant: "success" });
    } catch {
      enqueueSnackbar("خطا در تغییر وضعیت مقاله", { variant: "error" });
    } finally {
      setIsMutatingId(null);
    }
  };

  const onDelete = async (id: string) => {
    const ok = window.confirm("این مقاله حذف شود؟");
    if (!ok) return;

    setIsMutatingId(id);
    try {
      await deleteAticlesService(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      enqueueSnackbar("مقاله حذف شد", { variant: "success" });
    } catch {
      enqueueSnackbar("خطا در حذف مقاله", { variant: "error" });
    } finally {
      setIsMutatingId(null);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">مقالات</h1>
          <p className="mt-1 text-sm text-foreground/70">لیست مقالات ایجاد شده</p>
        </div>
        <Link to="/articles/new" className="inline-flex items-center justify-center rounded-xl bg-secondary px-4 py-2 text-sm text-secondary-foreground">
          ایجاد مقاله جدید
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-black/5 bg-white/60 p-6 text-sm text-foreground/70">در حال دریافت مقالات...</div>
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white/60">
          <div className="grid grid-cols-12 gap-3 border-b border-black/5 px-4 py-3 text-xs text-foreground/70">
            <div className="col-span-2 hidden sm:block">تصویر</div>
            <div className="col-span-6 sm:col-span-4">عنوان / خلاصه</div>
            <div className="col-span-2">وضعیت</div>
            <div className="col-span-2">تاریخ</div>
            <div className="col-span-2 text-left">عملیات</div>
          </div>

          <ul className="divide-y divide-black/5">
            {rows.map((row) => (
              <li key={row.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3">
                <div className="col-span-2 hidden sm:block">
                  {row.image ? (
                    <img src={row.image} alt="" className="h-10 w-10 rounded-xl border border-black/5 object-cover" loading="lazy" />
                  ) : (
                    <div className="h-10 w-10 rounded-xl border border-dashed border-black/10 bg-white/50" />
                  )}
                </div>

                <div className="col-span-6 sm:col-span-4 min-w-0">
                  <div className="truncate text-sm font-medium">{row.title}</div>
                  {row.summary ? <div className="mt-0.5 truncate text-xs text-foreground/70">{row.summary}</div> : null}
                </div>

                <div className="col-span-2">
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-1 text-[10px] font-semibold",
                      row.status === "published" ? "bg-green-100 text-green-800" : "bg-black/5 text-foreground/70",
                    ].join(" ")}
                  >
                    {row.status === "published" ? "منتشر شده" : "پیش‌نویس"}
                  </span>
                </div>

                <div className="col-span-2 text-xs text-foreground/70">{row.createdAt}</div>

                <div className="col-span-2 flex justify-start gap-2">
                  <Link to={`/articles/${row.id}/edit`} className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-3 py-2 text-xs hover:bg-black/5">
                    ویرایش
                  </Link>
                  {row.status === "draft" ? (
                    <button
                      type="button"
                      disabled={!row.canPublish || isMutatingId === row.id}
                      onClick={() => {
                        if (!row.canPublish) return;
                        void onChangeStatus(row.id, "published");
                      }}
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      انتشار
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isMutatingId === row.id}
                      onClick={() => void onChangeStatus(row.id, "draft")}
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-black/10 bg-white px-3 py-2 text-xs hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      عدم انتشار
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isMutatingId === row.id}
                    onClick={() => void onDelete(row.id)}
                    className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={page <= 1 || isLoading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-3 py-2 text-xs hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          صفحه قبل
        </button>
        <div className="text-xs text-foreground/70">صفحه {page}</div>
        <button
          type="button"
          disabled={isLoading || rows.length < limit}
          onClick={() => setPage((p) => p + 1)}
          className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-3 py-2 text-xs hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          صفحه بعد
        </button>
      </div>
    </div>
  );
}
