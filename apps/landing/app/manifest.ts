import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Code Legends",
    short_name: "Code Legends",
    description:
      "Plataforma de educação em programação para se tornar lendário no mercado tech.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0c0d",
    theme_color: "#00c8ff",
    lang: "pt-BR",
    icons: [
      {
        src: "/code-legends-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
