"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { loginAction, type AuthState } from "./actions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const initialState: AuthState = {};

export default function LoginPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const boundAction = loginAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            {tCommon("appName")}
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            {t("loginTitle")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t("loginSubtitle")}</p>
        </div>

        {/* Error */}
        {state.error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {/* Form */}
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="form-label">
              {t("emailLabel")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="form-label mb-0">
                {t("passwordLabel")}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full"
          >
            {isPending ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              t("loginButton")
            )}
          </button>
        </form>

        {/* Signup link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {t("noAccount")}{" "}
          <Link href="/signup" className="font-medium text-blue-600 hover:underline">
            {t("signupLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}