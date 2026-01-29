import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logOut } from "../lib/auth";

function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-background text-foreground font-vazir" dir="rtl" lang="fa">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary" aria-hidden="true" />
            <div className="!leading-tight">
              <div className="text-sm font-semibold">پنل مدیریت</div>
              <div className="text-xs text-foreground/70">Mini CMS</div>
            </div>
          </div>

          <nav className="flex items-center gap-2 text-sm">
            <NavLink to="/articles" className={({ isActive }) => ["rounded-xl px-3 py-2 transition", isActive ? "bg-primary text-primary-foreground" : "hover:bg-black/5"].join(" ")}>
              مقالات
            </NavLink>
            <NavLink to="/tags" className={({ isActive }) => ["rounded-xl px-3 py-2 transition", isActive ? "bg-primary text-primary-foreground" : "hover:bg-black/5"].join(" ")}>
              تگ‌ها
            </NavLink>
            <NavLink to="/articles/new" className={({ isActive }) => ["rounded-xl px-3 py-2 transition", isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-black/5"].join(" ")}>
              ایجاد مقاله
            </NavLink>
            <button
              type="button"
              onClick={() => {
                logOut();
                navigate("/login", { replace: true });
              }}
              className="rounded-xl px-3 py-2 transition hover:bg-black/5"
            >
              خروج
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-black/5 py-6">
        <div className="mx-auto max-w-6xl px-4 text-xs text-foreground/60">ساخته شده توسط امیرحسین هاشمی</div>
      </footer>
    </div>
  );
}

export default AdminLayout;
