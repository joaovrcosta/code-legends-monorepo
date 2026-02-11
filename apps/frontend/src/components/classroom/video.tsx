import Image from "next/image";
import notFoundImg from "../../../public/not-found.png";
import { TitleAccordion } from "../learn/title-accordion";
import { LevelAccordion } from "../learn/level-accordion";
import { LessonsAccordion } from "../learn/lessons-accordion";

interface VideoComponentProps {
  src?: string | null;
  title: string | undefined;
  description?: string;
}

// Função auxiliar: converte links normais do YouTube em embed
function formatYouTubeUrl(url?: string | null) {
  if (!url) return null;

  // Se já for embed
  if (url.includes("youtube.com/embed/")) return url;

  // watch?v=...
  const match = url.match(/v=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  // youtu.be/...
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (short && short[1]) {
    return `https://www.youtube.com/embed/${short[1]}`;
  }

  return null;
}

export default function VideoComponent({
  src,
  title,
  description,
}: VideoComponentProps) {
  const embedSrc =
    formatYouTubeUrl(src) ||
    // fallback para teste, se quiser deixar um vídeo padrão:
    "https://www.youtube.com/embed/vJt_K1bFUeA?list=PLnDvRpP8Bnex2GQEN0768_AxZg_RaIGmw";

  return (
    <div className="flex flex-col lg:px-0 px-0 h-full">
      {/* Header mobile */}
      <div className="lg:hidden flex items-center justify-center lg:py-6 py-0 my-6 px-2">
        <div className="flex flex-col items-center">
          <p className="text-sm font-light text-[#787878]">Chapter 1</p>
          <h3 className="text-[20px] text-center">{title || "Iniciando com ReactJS"}</h3>
        </div>
      </div>

      {/* Player */}
      <div className="relative w-full max-h-[570px] rounded-lg aspect-[16/9] overflow-hidden">
        {embedSrc ? (
          <iframe
            className="absolute top-0 left-0 w-full h-full border-none rounded-lg"
            src={embedSrc}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <Image
              src={notFoundImg}
              alt="Not Found"
              width={500}
              height={500}
              className="rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Acordeões */}
    <div className="">
    <TitleAccordion title={title} description={description} />
    <LevelAccordion />
    <LessonsAccordion />
    </div>
      
    </div>
  );
}
