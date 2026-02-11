// Este layout agora é simplificado pois o AppShell está no layout principal
// Mantemos este arquivo apenas para compatibilidade, mas o layout principal já cuida de tudo
export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
