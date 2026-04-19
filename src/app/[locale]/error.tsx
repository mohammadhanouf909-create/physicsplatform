"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // تسجيل الخطأ عشان لو حبيت تراجعه في الكونسول
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-5 px-4 text-center">
      <div className="rounded-full bg-red-100 p-4">
        <span className="text-4xl">⚠️</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-900">
        عفواً، حدث خطأ غير متوقع!
      </h2>
      <p className="text-sm text-slate-500 max-w-md">
        {error.message || "واجهنا مشكلة أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى."}
      </p>
      <button
        onClick={() => reset()}
        className="btn-primary px-6 py-2"
      >
        حاول مرة أخرى
      </button>
    </div>
  );
}