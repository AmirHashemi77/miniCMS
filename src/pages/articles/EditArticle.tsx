import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ArticleEditorForm from "../../components/articles/ArticleEditorForm";
import { getArticle, updateArticle } from "../../lib/articlesStorage";
import type { Article } from "../../types/article";
import { formatFaDate } from "../../lib/dates";

export default function EditArticle() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ?? "";

  const [, forceRender] = useState(0);
  const article: Article | null = id ? getArticle(id) : null;

  const meta = useMemo(() => {
    if (!article) return null;
    return {
      createdAt: formatFaDate(article.createdAt),
      updatedAt: formatFaDate(article.updatedAt),
    };
  }, [article]);

  if (!id) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white/60 p-6">
        <h1 className="text-lg font-semibold">شناسه مقاله نامعتبر است</h1>
        <div className="mt-4">
          <Link to="/articles" className="text-sm text-primary underline">
            بازگشت
          </Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white/60 p-6">
        <h1 className="text-lg font-semibold">مقاله پیدا نشد</h1>
        <p className="mt-2 text-sm text-foreground/70">ممکن است حذف شده باشد یا وجود نداشته باشد.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link to="/articles" className="text-sm text-primary underline">
            بازگشت به لیست
          </Link>
          <Link
            to="/articles/new"
            className="inline-flex items-center justify-center rounded-xl bg-secondary px-4 py-2 text-sm text-secondary-foreground"
          >
            ایجاد مقاله جدید
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">ویرایش مقاله</h1>
          {meta ? (
            <div className="mt-1 text-xs text-foreground/70">
              ایجاد: {meta.createdAt} • آخرین تغییر: {meta.updatedAt}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => navigate("/articles")}
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5"
        >
          بازگشت به لیست
        </button>
      </div>

      <ArticleEditorForm
        key={`${article.id}:${article.updatedAt}`}
        initialTitle={article.title}
        initialSummary={article.summary}
        initialImage={article.image}
        initialValue={article.value}
        saveLabel="ذخیره تغییرات"
        onSave={({ title, summary, image, value, html }) => {
          updateArticle(article.id, { title, summary, image, value, html });
          forceRender((t) => t + 1);
        }}
      />
    </div>
  );
}
