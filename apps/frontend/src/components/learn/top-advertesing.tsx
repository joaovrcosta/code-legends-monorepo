"use client";

const showTopBanner =
    process.env.NEXT_PUBLIC_SHOW_TOP_BANNER === "true";

export function TopAdvertesing() {
    if (!showTopBanner) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[60] w-full bg-[#1a1a1e] text-white"
            style={{ height: "var(--top-banner-height)" }}
        >
            <div className="flex h-full flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
                <span className="text-sm font-medium">Top Advertising</span>
                <span className="text-center text-sm text-white/95">
                    Mensagem ou anúncio
                </span>
                <button
                    type="button"
                    className="rounded-md border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-medium transition hover:bg-white/20"
                >
                    Ação
                </button>
            </div>
        </div>
    );
}
