"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverAnchor,
} from "@/components/ui/popover";
import { PrimaryButton } from "../ui/primary-button";
import { FastForward, Lock } from "@phosphor-icons/react/dist/ssr";
import { CirclePlay } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lesson, RoadmapResponse } from "@/types/roadmap";
import { useCourseModalStore } from "@/stores/course-modal-store";
import { generateLessonUrl, findLessonContext } from "@/utils/lesson-url";
import { LessonPlatformIcon } from "./svgs/lesson-platform-icon";
import { motion } from "framer-motion";

export const LessonPopover = ({
  lesson,
  openPopover,
  togglePopover,
  showContinue,
  setShowContinue,
  completed,
  locked,
  allLessons,
  roadmap,
}: {
  lesson: Lesson;
  openPopover: number | null;
  togglePopover: (id: number) => void;
  showContinue: boolean;
  setShowContinue: (state: boolean) => void;
  completed: boolean;
  locked: boolean;
  currentCourseSlug: string;
  allLessons?: Lesson[];
  roadmap?: RoadmapResponse;
  isFirstInModule?: boolean;
}) => {
  const {
    setLessonsForPage,
    setLessonForPage,
    isOpen: isModalOpen,
  } = useCourseModalStore();
  const router = useRouter();

  const handleWatchClick = () => {
    if (!locked) {
      // Tenta gerar URL dinâmica se tiver roadmap
      if (roadmap?.modules) {
        const context = findLessonContext(lesson.id, roadmap.modules);
        if (context) {
          const url = generateLessonUrl(lesson, context.module, context.group);
          router.push(url);
          return;
        }
      }

      // Fallback: atualiza a store e navega para /classroom
      if (allLessons && allLessons.length > 0) {
        const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
        setLessonsForPage(allLessons, currentIndex >= 0 ? currentIndex : 0);
      } else {
        setLessonForPage(lesson);
      }
      router.push("/classroom");
    }
  };

  return (
    <div>
      {showContinue && !isModalOpen ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowContinue(false);
            togglePopover(lesson.id);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowContinue(false);
            togglePopover(lesson.id);
          }}
          className="touch-manipulation"
        >
          <Popover open={true}>
            <PopoverAnchor asChild>
              <button
                className="cursor-pointer flex items-center justify-center"
                type="button"
              >
                <LessonPlatformIcon
                  size={92}
                  completed={completed}
                  disabled={locked}
                />
              </button>
            </PopoverAnchor>
            <PopoverContent
              className="!bg-[#121214] rounded-full"
              side="top"
              asChild
            >
              <motion.div
                className="w-[130px] cursor-pointer text-center bg-[#121214] rounded-full border-2 border-[#25252A] shadow-lg px-4 py-3 hover:bg-[#25252A] touch-manipulation"
                style={{
                  backgroundColor: '#121214',
                  transformOrigin: 'center center'
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1]
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContinue(false);
                  togglePopover(lesson.id);
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  setShowContinue(false);
                  togglePopover(lesson.id);
                }}
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-white text-sm font-semibold leading-tight">Começar</span>
                </div>
                <PopoverArrow className="fill-[#25252A] w-4 h-4" />
              </motion.div>
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <Popover
          open={openPopover === lesson.id && !isModalOpen}
          onOpenChange={(open) => {
            // Quando o popover é fechado (clicando fora ou pressionando ESC)
            if (!open && openPopover === lesson.id) {
              togglePopover(lesson.id);
            }
          }}
        >
          <PopoverTrigger asChild>
            <button
              className="cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Toggle: se estiver aberto, fecha; se estiver fechado, abre
                togglePopover(lesson.id);
              }}
              type="button"
            >
              <LessonPlatformIcon
                size={92}
                completed={completed}
                disabled={locked}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="!bg-[#1a1a1e] !text-white rounded-[20px]"
            asChild
          >
            <motion.div
              className="w-[295px] bg-[#1a1a1e] rounded-[20px] border border-[#25252A] shadow-lg p-4 z-50 outline-none text-white"
              style={{
                backgroundColor: '#1a1a1e',
                transformOrigin: 'center center'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <div className="mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-xs">
                    {lesson.type}
                  </span>
                  <span className="text-xs text-[#7e7e89]">
                    {lesson.video_duration || "Aula"}
                  </span>
                </div>
                <h3 className="text-xl mt-2 text-white">{lesson.title}</h3>
                {lesson.description && (
                  <p className="text-sm text-[#7e7e89] mt-1">
                    {lesson.description}
                  </p>
                )}
              </div>

              <PrimaryButton disabled={locked} onClick={handleWatchClick}>
                {locked ? "Bloqueado" : completed ? "Revisar" : "Assistir"}
                {locked ? <Lock /> : <CirclePlay />}
              </PrimaryButton>

              {(lesson.type === "project" || lesson.type === "quiz") && (
                <Link href={`/skip-lesson/${lesson.id}`}>
                  <PrimaryButton className="mt-2" disabled={locked}>
                    Pular
                    <FastForward size={24} weight="fill" />
                  </PrimaryButton>
                </Link>
              )}

              <PopoverArrow className="fill-[#1a1a1e] w-4 h-4 transform translate-y-[-2px]" />
            </motion.div>
          </PopoverContent>
        </Popover>

      )
      }
    </div >
  );
};
