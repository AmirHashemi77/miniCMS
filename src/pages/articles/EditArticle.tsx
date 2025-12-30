import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import ArticleEditorForm from "../../components/articles/ArticleEditorForm";
import type { Article } from "../../types/article";
import { formatFaDate } from "../../lib/dates";
import { deleteAticlesService, editAticlesService, getAticleService } from "../../services/article.services";

export default function EditArticle() {
  const params = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const id = params.id ?? "";

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isStale = false;

    const run = async () => {
      setIsLoading(true);
      setArticle(null);
      try {
        const response = await getAticleService(id);
        if (!isStale) setArticle(response.data);
      } catch {
        if (!isStale) setArticle(null);
      } finally {
        if (!isStale) setIsLoading(false);
      }
    };

    void run();
    return () => {
      isStale = true;
    };
  }, [id]);

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

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white/60 p-6">
        <h1 className="text-lg font-semibold">در حال دریافت مقاله...</h1>
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
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isMutating}
            onClick={() => navigate("/articles")}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            بازگشت به لیست
          </button>
          <button
            type="button"
            disabled={isMutating}
            onClick={() => {
              const ok = window.confirm("این مقاله حذف شود؟");
              if (!ok) return;
              void (async () => {
                setIsMutating(true);
                try {
                  await deleteAticlesService(article.id);
                  enqueueSnackbar("مقاله حذف شد", { variant: "success" });
                  navigate("/articles", { replace: true });
                } catch {
                  enqueueSnackbar("خطا در حذف مقاله", { variant: "error" });
                } finally {
                  setIsMutating(false);
                }
              })();
            }}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            حذف
          </button>
        </div>
      </div>

      <ArticleEditorForm
        key={`${article.id}:${article.updatedAt}`}
        initialTitle={article.title}
        initialSummary={article.summary}
        initialImage={article.image}
        initialTagIds={article.tagIds ?? []}
        initialValue={article.value}
        onSave={({ title, summary, image, status, tagIds, value, html }) => {
          if (isMutating) return;

          void (async () => {
            setIsMutating(true);
            try {
              const response = await editAticlesService(article.id, { title, summary, image, status, tagIds, value, html });
              const updated = (response.data as unknown) as Article | null;
              setArticle((prev) => {
                if (!prev) return updated;
                if (updated && updated.id) return updated;
                return { ...prev, title, summary, image, status, tagIds, value, html, updatedAt: new Date().toISOString() };
              });
              enqueueSnackbar("تغییرات ذخیره شد", { variant: "success" });
            } catch {
              enqueueSnackbar("خطا در ذخیره مقاله", { variant: "error" });
            } finally {
              setIsMutating(false);
            }
          })();
        }}
      />
    </div>
  );
}
