export type PlatformFeature = {
  id: string;
  step: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

export const platformSection = {
  id: "plataforma",
  eyebrow: "Plataforma",
  title: "Transforme seu ensino em um caminho guiado com nossa plataforma",
  description:
    "Dashboard, progresso, gamificação e ferramentas pensadas para manter você no ritmo certo.",
} as const;

export const platformFeatures: PlatformFeature[] = [
  {
    id: "performance",
    step: "01 Desempenho",
    title: "Acompanhe sua evolução em tempo real",
    description:
      "Visualize XP, streak, skills e progresso por curso em um dashboard claro e motivador.",
    image: "/sections/platform-dashboard.svg",
    imageAlt: "Dashboard de desempenho da plataforma Code Legends",
  },
  {
    id: "roadmap",
    step: "02 Trilha guiada",
    title: "Saiba exatamente o próximo passo",
    description:
      "Roadmap interativo com módulos, aulas e desafios organizados para você não se perder.",
    image: "/sections/platform-roadmap.svg",
    imageAlt: "Roadmap de aprendizado na plataforma",
  },
  {
    id: "projects",
    step: "03 Projetos",
    title: "Aprenda construindo projetos reais",
    description:
      "Desafios práticos, quizzes e projetos que simulam o dia a dia de um dev profissional.",
    image: "/sections/platform-projects.svg",
    imageAlt: "Seção de projetos práticos",
  },
];
