export type PlanInfo = {
  title: string;
  description: string;
  price: string;
  installments: string;
  features: string[];
};

export const PLANOS: Record<string, PlanInfo> = {
  pro: {
    title: "Code Legends PRO",
    description:
      "Acesso por 12 meses a todos os conteúdos do catálogo, certificados e suporte para evoluir na programação.",
    price: "R$ 197,00",
    installments: "12x de R$ 19,75",
    features: [
      "Certificados de conclusão",
      "Acesso a todos os conteúdos do catálogo",
      "Projetos práticos para o portfólio",
      "Suporte para dúvidas",
      "Eventos e encontros ao vivo",
      "Acompanhamento do seu progresso",
    ],
  },
  premium: {
    title: "Code Legends PREMIUM",
    description:
      "Tudo do PRO com mentorias de carreira, divulgação de vagas e certificados ilimitados.",
    price: "R$ 397,00",
    installments: "12x de R$ 39,75",
    features: [
      "Tudo do plano PRO",
      "Mentorias de carreira",
      "Divulgação de vagas de parceiros",
      "Certificados ilimitados",
      "Suporte prioritário",
    ],
  },
};

export const INPUT_CLASS =
  "w-full h-12 px-4 rounded-lg bg-[#25252A] border border-[#25252A] text-white placeholder:text-[#7e7e89] focus:border-[#00C8FF]/50 focus:outline-none text-sm";
