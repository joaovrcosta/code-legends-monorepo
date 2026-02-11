import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meus Estudos - Code Legends",
  description: "Acompanhe seu progresso e continue seus estudos.",
};

export default function MyLearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
