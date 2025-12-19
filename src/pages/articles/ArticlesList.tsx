import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Node } from "slate";
import { deleteArticle, listArticles, updateArticle } from "../../lib/articlesStorage";
import { formatFaDate } from "../../lib/dates";
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
  const [articles, setArticles] = useState<Article[]>(() => listArticles());

  const rows = useMemo(() => {
    return articles.map((a) => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      image: a.image,
      status: a.status,
      canPublish:
        a.title.trim().length > 0 &&
        Node.string({ children: a.value } as unknown as Node).trim().length > 0,
      createdAt: formatFaDate(a.createdAt),
    }));
  }, [articles]);

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

      {rows.length === 0 ? (
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
	                      disabled={!row.canPublish}
	                      onClick={() => {
	                        if (!row.canPublish) return;
	                        const updated = updateArticle(row.id, { status: "published" });
	                        if (!updated) return;
	                        setArticles((prev) => prev.map((a) => (a.id === row.id ? updated : a)));
	                      }}
	                      className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
	                    >
	                      انتشار
	                    </button>
	                  ) : (
	                    <button
	                      type="button"
	                      onClick={() => {
	                        const updated = updateArticle(row.id, { status: "draft" });
	                        if (!updated) return;
	                        setArticles((prev) => prev.map((a) => (a.id === row.id ? updated : a)));
	                      }}
	                      className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-black/10 bg-white px-3 py-2 text-xs hover:bg-black/5"
	                    >
	                      عدم انتشار
	                    </button>
	                  )}
	                  <button
	                    type="button"
	                    onClick={() => {
	                      const ok = window.confirm("این مقاله حذف شود؟");
	                      if (!ok) return;
                      deleteArticle(row.id);
                      setArticles((prev) => prev.filter((a) => a.id !== row.id));
                    }}
                    className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 hover:bg-red-100"
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
