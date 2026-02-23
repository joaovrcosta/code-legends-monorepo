import { CartContent } from "@/components/cart/cart-content";
import { notFound } from "next/navigation";

const VALID_PLANOS = ["pro", "premium"] as const;

export const dynamic = "force-dynamic";

export default async function CartPage({
  params,
}: {
  params: Promise<{ "plano-selecionado": string }>;
}) {
  const { "plano-selecionado": planSlug } = await params;
  const normalized = planSlug?.toLowerCase();

  if (!normalized || !VALID_PLANOS.includes(normalized as (typeof VALID_PLANOS)[number])) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#121214]">
      <CartContent planSlug={normalized} />
    </div>
  );
}
