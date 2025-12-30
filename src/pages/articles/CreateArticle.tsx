import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import ArticleEditorForm from "../../components/articles/ArticleEditorForm";
import { DEFAULT_SLATE_VALUE } from "../../lib/articlesStorage";
import { createAticlesService } from "../../services/article.services";
import type { Article } from "../../types/article";

export default function CreateArticle() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-lg font-semibold">ایجاد مقاله</h1>
        <p className="mt-1 text-sm text-foreground/70">برای ایجاد مقاله جدید، اطلاعات موردنظر را در فیلدهای زیر وارد کنید.</p>
      </div>

      <ArticleEditorForm
        initialTitle=""
        initialSummary=""
        initialImage={null}
        initialTagIds={[]}
        initialValue={DEFAULT_SLATE_VALUE}
        onSave={({ title, summary, image, status, tagIds, value, html }) => {
          if (isSubmitting) return;

          void (async () => {
            setIsSubmitting(true);
            try {
              const response = await createAticlesService({ title, summary, image, status, tagIds, value, html });
              const data = response.data as unknown;
              const created = (data as any)?.id ? (data as Article) : ((data as any)?.data as Article | undefined);

              enqueueSnackbar("مقاله ایجاد شد", { variant: "success" });

              if (created?.id) {
                navigate(`/articles/${created.id}/edit`, { replace: true });
              } else {
                navigate("/articles", { replace: true });
              }
            } catch {
              enqueueSnackbar("خطا در ایجاد مقاله", { variant: "error" });
            } finally {
              setIsSubmitting(false);
            }
          })();
        }}
      />
    </div>
  );
}
