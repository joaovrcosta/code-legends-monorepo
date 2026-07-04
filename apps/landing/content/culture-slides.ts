export type CultureSlide = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

export const cultureSection = {
  id: "cultura",
  eyebrow: "Comunidade",
  title: "Muito mais do que código",
  description:
    "Eventos, networking e uma comunidade que te impulsiona além das aulas.",
} as const;

export const cultureSlides: CultureSlide[] = [
  {
    id: "events",
    title: "Eventos ao vivo",
    description: "Workshops, lives e encontros com a comunidade Code Legends.",
    image: "/sections/culture-events.svg",
    imageAlt: "Eventos da comunidade Code Legends",
  },
  {
    id: "network",
    title: "Networking",
    description: "Conecte-se com outros devs em formação e profissionais do mercado.",
    image: "/sections/culture-network.svg",
    imageAlt: "Networking entre alunos",
  },
  {
    id: "career",
    title: "Carreira",
    description: "Conteúdo e orientações para você se posicionar no mercado tech.",
    image: "/sections/culture-career.svg",
    imageAlt: "Orientação de carreira",
  },
];
