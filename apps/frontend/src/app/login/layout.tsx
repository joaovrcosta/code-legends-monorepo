import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Code Legends",
  description: "Faça login na sua conta Code Legends e continue aprendendo programação.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
