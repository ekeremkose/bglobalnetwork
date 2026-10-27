import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/guard";
import { adminBasePath } from "@/lib/config/admin";
import { signInAction } from "@/app/internal-admin/giris/actions";

export const metadata = { title: "Giriş — Yönetim" };

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const base = adminBasePath();
  if (!base) notFound();
  if (await getAdminSession()) redirect(base);
  const { error } = await searchParams;
  const configured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.AUTH_SECRET);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 text-slate-900">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">B-Global Yönetim</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Yalnızca yetkili Google hesabı ile giriş yapılabilir.
        </p>
        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            Bu Google hesabı ile giriş yapılamadı. Yetkili hesabı seçtiğinizden emin olun.
          </p>
        )}
        {!configured && (
          <p role="note" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Google girişi bu ortamda henüz yapılandırılmadı.
          </p>
        )}
        <form action={signInAction} className="mt-5">
          <button
            type="submit"
            disabled={!configured}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Google ile giriş yap
          </button>
        </form>
      </div>
    </div>
  );
}
