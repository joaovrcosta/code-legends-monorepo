import { appPath } from "@/lib/env";

export const navLinks = [
  { label: "Cursos", href: "#cursos" },
  { label: "Plataforma", href: "#plataforma" },
  { label: "Sobre", href: "#sobre" },
] as const;

export const footerLinks = {
  product: [
    { label: "Cursos", href: "#cursos" },
    { label: "Plataforma", href: "#plataforma" },
    { label: "Planos", href: appPath("/plans") },
  ],
  legal: [
    { label: "Termos de uso", href: "#" },
    { label: "Privacidade", href: "#" },
  ],
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
} as const;

export const heroContent = {
  headlinePrefix: "Impossível não ser uma",
  headlineHighlight: "lenda da programação",
  description:
    "Se torne um dos profissionais mais disputados no mundo da programação com os cursos completos e didáticos do Code Legends.",
  instructor: {
    name: "Instrutor Code Legends",
    role: "Fundador & Lead Instructor",
    avatar: "/sections/instructor-avatar.svg",
  },
  primaryCta: { label: "Quero ser uma lenda", href: appPath("/signup") },
  secondaryCta: { label: "Já tenho conta", href: appPath("/login") },
  video: {
    poster: "/sections/hero-video-poster.svg",
    src: "/videos/intro-code-legends.mp4",
  },
} as const;

export const socialProofLogos = [
  { name: "Vercel", src: "/logos/vercel.svg" },
  { name: "AWS", src: "/logos/aws.svg" },
  { name: "React", src: "/logos/react.svg" },
  { name: "Node.js", src: "/logos/nodejs.svg" },
  { name: "TypeScript", src: "/logos/typescript.svg" },
] as const;

export const finalCtaContent = {
  title: "Descubra se programação é para você",
  description:
    "Comece gratuitamente e explore trilhas guiadas, projetos práticos e uma plataforma feita para acelerar sua evolução.",
  cta: { label: "Começar agora", href: appPath("/login") },
  backgroundImage: "/sections/final-cta-bg.svg",
} as const;
