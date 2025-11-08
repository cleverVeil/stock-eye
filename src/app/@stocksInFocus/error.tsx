"use client";

import Link from "next/link";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({
  title = "Something went wrong",
  message = "Please try again later.",
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md w-full shadow">
        <h2 className="text-2xl font-semibold text-red-700 mb-2">
          {title}
        </h2>
        <p className="text-red-600 mb-6">{message}</p>

        <div className="flex flex-wrap gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
