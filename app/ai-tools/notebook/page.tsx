"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Suspense } from 'react';

function NotebookContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const encodedUrl = searchParams.get('url');
    const email = searchParams.get('email');
    
    if (encodedUrl && email) {
      const fullUrl = `${decodeURIComponent(encodedUrl)}?authuser=${email}`;
      // Redirect to Google Colab
      window.location.href = fullUrl;
    }
  }, [searchParams]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 animate-spin text-blue-600 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Opening Google Colab...</h2>
        <p className="text-slate-600 mb-6">Please wait while we redirect you to your notebook</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white rounded-lg transition-colors border border-slate-200 bg-white"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>
      </div>
    </div>
  );
}

export default function NotebookPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 animate-spin text-blue-600 mx-auto" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <NotebookContent />
    </Suspense>
  );
}
