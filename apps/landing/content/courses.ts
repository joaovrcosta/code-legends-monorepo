export type CourseCard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
};

export const coursesSection = {
  id: "cursos",
  eyebrow: "Cursos & Carreiras",
  title: "Cursos & carreiras para o teu aprendizado",
  description:
    "Trilhas completas do zero ao avançado, com foco em mercado de trabalho e projetos reais.",
} as const;

export const courses: CourseCard[] = [
  {
    id: "react",
    title: "React.js",
    description:
      "Domine componentes, hooks, performance e padrões usados em produtos reais.",
    icon: "/sections/course-react.svg",
    href: "#",
  },
  {
    id: "node",
    title: "Node.js",
    description:
      "APIs escaláveis, autenticação, banco de dados e arquitetura backend moderna.",
    icon: "/sections/course-node.svg",
    href: "#",
  },
  {
    id: "typescript",
    title: "TypeScript",
    description:
      "Tipagem forte, generics e boas práticas para código seguro e manutenível.",
    icon: "/sections/course-typescript.svg",
    href: "#",
  },
  {
    id: "fullstack",
    title: "Full Stack",
    description:
      "Trilha completa do frontend ao backend para se tornar dev completo.",
    icon: "/sections/course-fullstack.svg",
    href: "#",
  },
];
