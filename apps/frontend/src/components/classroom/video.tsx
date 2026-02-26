"use client";

import Image from "next/image";
import notFoundImg from "../../../public/not-found.png";
import { TitleAccordion } from "../learn/title-accordion";
import { LevelAccordion } from "../learn/level-accordion";
import { LessonsAccordion } from "../learn/lessons-accordion";
import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface VideoComponentProps {
  src?: string | null;
  title: string | undefined;
  description?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const isDirectVideo = isDirectVideoUrl(src) && (embedSrc ? !!src : !!src);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) setCurrentTime(video.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) setDuration(video.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      if (!video || duration <= 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      video.currentTime = pct * duration;
      setCurrentTime(video.currentTime);
    },
    [duration],
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = v;
      video.muted = v === 0;
    }
    setVolume(v);
    setIsMuted(v === 0);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isDirectVideo) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [isDirectVideo]);

  if (src && !embedSrc && !isDirectVideoUrl(src)) {
    console.warn("URL de vídeo não reconhecida:", src);
  }

  return (
    <div className="flex flex-col lg:px-0 px-0 min-h-0 w-full">
      {/* Header mobile */}
      <div className="lg:hidden flex items-center justify-center lg:py-6 py-0 my-6 px-2">
        <div className="flex flex-col items-center w-full min-w-0 px-2">
          <p className="text-sm font-light text-[#787878]">Chapter 1</p>
          <h3 className="text-[20px] text-center truncate w-full max-w-full" title={title || undefined}>
            {title || "Iniciando com ReactJS"}
          </h3>
        </div>
      </div>

      {/* Player: container 16:9 com fundo preto; vídeo com object-contain para letterbox/pillarbox */}
      <div
        ref={containerRef}
        className="relative w-full max-h-[570px] rounded-lg aspect-[16/9] overflow-hidden bg-black group shrink-0"
      >
        {embedSrc ? (
          isDirectVideoUrl(src) ? (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full rounded-lg object-contain"
                src={src || undefined}
                title={title}
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                playsInline
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
              {/* Controles customizados: largura total sobre o container (inclui faixas pretas) */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-2 px-3 rounded-b-lg">
                <div
                  className="h-1.5 w-full rounded-full bg-white/20 cursor-pointer mb-2"
                  onClick={handleProgressClick}
                  role="progressbar"
                  aria-valuenow={duration ? (currentTime / duration) * 100 : 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-150"
                    style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-1.5 rounded-full text-white hover:bg-white/20 transition-colors"
                    aria-label={isPlaying ? "Pausar" : "Reproduzir"}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <span className="text-xs text-white/90 tabular-nums min-w-[4ch]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  <div className="flex items-center gap-1 flex-1 justify-end">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-1.5 rounded-full text-white hover:bg-white/20 transition-colors"
                      aria-label={isMuted ? "Ativar som" : "Silenciar"}
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 accent-cyan-400 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="p-1.5 rounded-full text-white hover:bg-white/20 transition-colors"
                      aria-label="Tela cheia"
                    >
                      <Maximize size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <iframe
              className="absolute inset-0 w-full h-full border-none rounded-lg object-contain"
              src={embedSrc}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )
        ) : src && isDirectVideoUrl(src) ? (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full rounded-lg object-contain"
              src={src}
              title={title}
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              playsInline
            >
              Seu navegador não suporta o elemento de vídeo.
            </video>
            <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-2 px-3 rounded-b-lg">
              <div
                className="h-1.5 w-full rounded-full bg-white/20 cursor-pointer mb-2"
                onClick={handleProgressClick}
                role="progressbar"
                aria-valuenow={duration ? (currentTime / duration) * 100 : 0}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-150"
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
                />
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={togglePlay} className="p-1.5 rounded-full text-white hover:bg-white/20 transition-colors" aria-label={isPlaying ? "Pausar" : "Reproduzir"}>
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <span className="text-xs text-white/90 tabular-nums min-w-[4ch]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <div className="flex items-center gap-1 flex-1 justify-end">
                  <button type="button" onClick={toggleMute} className="p-1.5 rounded-full text-white hover:bg-white/20 transition-colors" aria-label={isMuted ? "Ativar som" : "Silenciar"}>
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-20 h-1 accent-cyan-400 cursor-pointer" />
                  <button type="button" onClick={toggleFullscreen} className="p-1.5 rounded-full text-white hover:bg-white/20 transition-colors" aria-label="Tela cheia">
                    <Maximize size={20} />
                  </button>
                </div>
              </div>
            </div>
          </>
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

      <div className="">
        <TitleAccordion title={title} description={description} />
        <LevelAccordion />
        <LessonsAccordion />
      </div>

    </div>
  );
}
