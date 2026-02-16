import { PrimaryButton } from "@/components/ui/primary-button";
import Image from "next/image";
import Link from "next/link";
import onboardingImage from "../../../public/onboarding-img-1.png";
import codeLogo from "../../../public/code-legends-logo.svg";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Onboarding - Code Legends",
  description: "Configure seu perfil e comece sua jornada de aprendizado.",
};

export default function OnboardingPage() {
  return (
    <div className="flex justify-center items-center h-screen relative overflow-hidden bg-[#0D0D12]">
      <div className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] top-0 left-0 rounded-full bg-[#00b3ffa9] opacity-40 blur-[100px] md:blur-[150px] lg:blur-[200px] pointer-events-none" />
      <div className="absolute w-[150px] h-[150px] md:w-[250px] md:h-[250px] lg:w-[300px] lg:h-[300px] top-[10%] left-[20%] md:top-[15%] md:left-[25%] lg:top-[20%] lg:left-[30%] rounded-full bg-[#00b3ff5b] opacity-30 blur-[100px] md:blur-[150px] lg:blur-[200px] pointer-events-none" />
      <div className="absolute w-[250px] h-[250px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bottom-0 right-0 rounded-full bg-[#00b3ffb6] opacity-40 blur-[120px] md:blur-[180px] lg:blur-[220px] pointer-events-none" />

      <div className="max-w-3xl w-full space-y-8 p-4 z-50">
        <div className="space-y-4 text-center">
          <div className="w-full flex justify-center items-center mb-10">
            <Image src={codeLogo} alt="Code Legends" width={149} height={16} />
          </div>

          <h3 className="text-white text-2xl font-bold">Bem vindo Lenda!</h3>
          <p className="text-muted-foreground text-md">
            Em poucos passos, você vai descobrir todas as possibilidades que
            preparamos para impulsionar seu desenvolvimento. Bora começar?
          </p>
          <Image src={onboardingImage} alt="Onboarding" />
        </div>

        <div className="flex justify-center">
          <Link href="/onboarding/pick-a-goal">
            <PrimaryButton className="min-w-[200px]">
              Iniciar Jornada
            </PrimaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
