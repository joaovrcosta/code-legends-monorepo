import { PostPaymentWelcomeGate } from "@/components/providers/post-payment-welcome-gate";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PostPaymentWelcomeGate />
    </>
  );
}
