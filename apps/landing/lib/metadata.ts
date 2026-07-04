import type { Metadata } from "next";
import { siteUrl } from "@/lib/env";

const defaultTitle = "Code Legends";
const defaultDescription =
  "Impossível não ser uma lenda da programação. Cursos completos, plataforma guiada e trilhas de carreira para você dominar o mercado tech.";

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${defaultTitle}`,
  },
  description: defaultDescription,
  keywords: [
    "programação",
    "cursos de programação",
    "carreira tech",
    "Code Legends",
    "React",
    "Node.js",
    "trilhas de aprendizado",
  ],
  authors: [{ name: "Code Legends" }],
  creator: "Code Legends",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: defaultTitle,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Code Legends — Plataforma de programação",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Code Legends",
        url: siteUrl,
        logo: `${siteUrl}/code-legends-logo.svg`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Code Legends",
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "pt-BR",
      },
    ],
  };
}
