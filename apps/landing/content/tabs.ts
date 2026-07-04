export type TabItem = {
  id: string;
  label: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  media: {
    type: "image" | "video";
    src: string;
    poster?: string;
    alt: string;
  };
};

export const tabsSection = {
  id: "sobre",
  eyebrow: "Tudo em um lugar",
  title: "Tudo que você precisa em apenas um lugar",
} as const;

export const tabItems: TabItem[] = [
  {
    id: "cursos",
    label: "Cursos",
    title: "Trilhas completas do básico ao avançado",
    description:
      "Cursos estruturados com videoaulas, artigos, desafios e projetos para fixar o conteúdo.",
    ctaLabel: "Explorar cursos",
    ctaHref: "#cursos",
    media: {
      type: "image",
      src: "/sections/tab-courses.svg",
      alt: "Catálogo de cursos",
    },
  },
  {
    id: "plataforma",
    label: "Plataforma",
    title: "Uma plataforma feita para manter o ritmo",
    description:
      "Gamificação, streak, XP e dashboard para você acompanhar cada conquista.",
    ctaLabel: "Conhecer plataforma",
    ctaHref: "#plataforma",
    media: {
      type: "image",
      src: "/sections/tab-platform.svg",
      alt: "Interface da plataforma",
    },
  },
  {
    id: "eventos",
    label: "Eventos",
    title: "Lives, workshops e encontros exclusivos",
    description:
      "Participe de eventos ao vivo e tire dúvidas diretamente com instrutores.",
    ctaLabel: "Ver eventos",
    ctaHref: "#cultura",
    media: {
      type: "image",
      src: "/sections/tab-events.svg",
      alt: "Eventos ao vivo",
    },
  },
  {
    id: "comunidade",
    label: "Comunidade",
    title: "Aprenda junto com outros devs",
    description:
      "Troque experiências, compartilhe progresso e cresça com a comunidade.",
    ctaLabel: "Entrar na comunidade",
    ctaHref: "#cultura",
    media: {
      type: "image",
      src: "/sections/tab-community.svg",
      alt: "Comunidade de alunos",
    },
  },
  {
    id: "vagas",
    label: "Vagas",
    title: "Prepare-se para o mercado",
    description:
      "Conteúdo de carreira, portfólio e orientações para você se destacar em processos seletivos.",
    ctaLabel: "Ver oportunidades",
    ctaHref: "#cursos",
    media: {
      type: "image",
      src: "/sections/tab-jobs.svg",
      alt: "Oportunidades de carreira",
    },
  },
];
