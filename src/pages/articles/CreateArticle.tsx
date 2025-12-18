import { useNavigate } from "react-router-dom";
import ArticleEditorForm from "../../components/articles/ArticleEditorForm";
import { createArticle, DEFAULT_SLATE_VALUE } from "../../lib/articlesStorage";

export default function CreateArticle() {
  const navigate = useNavigate();

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
        initialValue={DEFAULT_SLATE_VALUE}
        saveLabel="ذخیره"
        onSave={({ title, summary, image, value, html }) => {
          const article = createArticle({ title, summary, image, value, html });
          navigate(`/articles/${article.id}/edit`, { replace: true });
        }}
      />
    </div>
  );
}
