"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signupAction, type AuthState } from "../login/actions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const initialState: AuthState = {};

export default function SignupPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const boundAction = signupAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            {tCommon("appName")}
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            {t("signupTitle")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t("signupSubtitle")}</p>
        </div>

        {state.error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="form-label">
              {t("nameLabel")}
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              required
              className="form-input"
              placeholder="Ahmed Hassan"
            />
          </div>

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
            <label htmlFor="password" className="form-label">
              {t("passwordLabel")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="form-input"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-400">
              {t("passwordMinLength")}
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full"
          >
            {isPending ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              t("signupButton")
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t("hasAccount")}{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}