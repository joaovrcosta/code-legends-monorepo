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

// Função auxiliar: converte links do Streamable em embed
function formatStreamableUrl(url?: string | null) {
  if (!url) return null;

  // Se já for embed
  if (url.includes("streamable.com/e/")) return url;

  // streamable.com/xxxxx ou streamable.com/o/xxxxx
  const match = url.match(/streamable\.com\/(?:o\/)?([a-zA-Z0-9]+)/);
  if (match && match[1]) {
    return `https://streamable.com/e/${match[1]}`;
  }

  return null;
}

// Verifica se é URL do Streamable
function isStreamableUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.includes("streamable.com");
}

// Verifica se é uma URL direta de vídeo (mp4, webm, etc)
function isDirectVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m3u8'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
}

// Função auxiliar: converte links do Vimeo em embed
function formatVimeoUrl(url?: string | null) {
  if (!url) return null;

  // Se já for embed
  if (url.includes("player.vimeo.com/video/")) return url;

  // vimeo.com/xxxxx
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }

  return null;
}

// Função principal: formata URL do vídeo para embed
function formatVideoUrl(url?: string | null) {
  if (!url) return null;

  // YouTube
  const youtubeUrl = formatYouTubeUrl(url);
  if (youtubeUrl) return youtubeUrl;

  // Streamable
  const streamableUrl = formatStreamableUrl(url);
  if (streamableUrl) return streamableUrl;

  // Vimeo
  const vimeoUrl = formatVimeoUrl(url);
  if (vimeoUrl) return vimeoUrl;

  // Se já for uma URL de embed válida, retorna como está
  if (url.includes("/embed/") || url.includes("/e/") || url.includes("player.")) {
    return url;
  }

  return null;
}

export default function VideoComponent({
  src,
  title,
  description,
}: VideoComponentProps) {
  const embedSrc = formatVideoUrl(src);

  // Debug: log para verificar se a URL está sendo passada
  if (src && !embedSrc) {
    console.warn("URL de vídeo não reconhecida:", src);
  }

  // Log para debug
  console.log("VideoComponent - src:", src, "embedSrc:", embedSrc);

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
          isDirectVideoUrl(src) ? (
            <video
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              controls
              src={src || undefined}
              title={title}
            >
              Seu navegador não suporta o elemento de vídeo.
            </video>
          ) : (
            <iframe
              className="absolute top-0 left-0 w-full h-full border-none rounded-lg"
              src={embedSrc}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )
        ) : src && isDirectVideoUrl(src) ? (
          <video
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            controls
            src={src}
            title={title}
          >
            Seu navegador não suporta o elemento de vídeo.
          </video>
        ) : src && isStreamableUrl(src) ? (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-[#1A1A1E] rounded-lg border border-[#25252A]">
            <p className="text-white text-sm mb-4">Vídeo do Streamable</p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Assistir no Streamable
            </a>
          </div>
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
