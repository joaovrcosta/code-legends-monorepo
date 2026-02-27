import { CartContent } from "@/components/cart/cart-content";
import { getPlanBySlug } from "@/actions/plan/list-plans";
import { planFromApiToPlanInfo } from "@/lib/plan-utils";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CartPage({
  params,
}: {
  params: Promise<{ "plano-selecionado": string }>;
}) {
  const { "plano-selecionado": planSlug } = await params;
  const normalized = planSlug?.toLowerCase()?.trim();
  if (!normalized) {
    notFound();
  }

  const planFromApi = await getPlanBySlug(normalized);
  if (!planFromApi) {
    notFound();
  }

  const plan = planFromApiToPlanInfo(planFromApi);

  return (
    <div className="min-h-screen bg-[#121214]">
      <CartContent planSlug={normalized} plan={plan} />
    </div>
  );
}
