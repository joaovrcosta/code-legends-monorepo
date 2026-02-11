import Image from "next/image";
import onboardingImage from "../../../../public/onboarding-card.png";

export default function PickAGoalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Coluna Esquerda - Seção Informativa */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden max-w-[42%]">
        <Image
          src={onboardingImage}
          alt="Onboarding"
          className="object-cover w-full h-full"
          fill
          priority
        />
      </div>

      {/* Coluna Direita - Conteúdo das páginas */}
      <div className="w-full bg-[#0D0D12] flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
