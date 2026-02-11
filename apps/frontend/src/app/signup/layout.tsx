import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro - Code Legends",
  description: "Crie sua conta gratuita e comece a aprender programação do zero.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
