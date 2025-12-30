import type { FC, FormEvent } from "react";
import { useMemo, useState } from "react";
import type { Location } from "react-router-dom";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { adminLogInService } from "../services/login.services";
import { isAuthenticated } from "../lib/auth";

type LocationState = { from?: Location };

const Login: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.from;
  }, [location.state]);

  if (isAuthenticated()) {
    return <Navigate to="/articles" replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await adminLogInService({ email, password });
      enqueueSnackbar("با موفقیت وارد شدید", { variant: "success" });

      if (from) {
        navigate(`${from.pathname}${from.search}${from.hash}`, { replace: true });
      } else {
        navigate("/articles", { replace: true });
      }
    } catch {
      enqueueSnackbar("ایمیل یا رمز عبور اشتباه است", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground font-vazir" dir="rtl" lang="fa">
      <div className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white/50 p-6 shadow-sm backdrop-blur">
          <div className="mb-6">
            <div className="text-lg font-semibold">ورود به پنل</div>
            <div className="mt-1 text-sm text-foreground/70">برای ادامه وارد حساب مدیریت شوید</div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <div className="mb-1 text-sm">ایمیل</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-black/10 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="admin@example.com"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-sm">رمز عبور</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-black/10 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="••••••••"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "در حال ورود..." : "ورود"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
