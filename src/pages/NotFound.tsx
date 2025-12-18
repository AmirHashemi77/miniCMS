import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/60 p-6">
      <h1 className="text-lg font-semibold">صفحه پیدا نشد</h1>
      <p className="mt-2 text-sm text-foreground/70">مسیر وارد شده وجود ندارد.</p>
      <div className="mt-4">
        <Link
          to="/articles"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          بازگشت به مقالات
        </Link>
      </div>
    </div>
  );
}

export default NotFound;

