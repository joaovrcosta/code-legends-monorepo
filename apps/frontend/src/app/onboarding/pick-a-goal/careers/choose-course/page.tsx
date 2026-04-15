"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * A escolha de curso foi incorporada à página de carreiras (chat inline).
 * Mantemos esta rota para links antigos e redirecionamos com a query.
 */
function ChooseCourseRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("categorySlug");

  useEffect(() => {
    const target = categorySlug
      ? `/onboarding/pick-a-goal/careers?categorySlug=${encodeURIComponent(categorySlug)}`
      : "/onboarding/pick-a-goal/careers";
    router.replace(target);
  }, [router, categorySlug]);

  return (
    <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center bg-[#0D0D12] px-6 py-20">
      <p className="text-lg text-white/70">Redirecionando…</p>
    </div>
  );
}

export default function ChooseCoursePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center bg-[#0D0D12] px-6 py-20">
          <p className="text-lg text-white/70">Carregando…</p>
        </div>
      }
    >
      <ChooseCourseRedirectInner />
    </Suspense>
  );
}
