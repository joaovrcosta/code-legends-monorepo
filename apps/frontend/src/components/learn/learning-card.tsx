"use client";

import { useState } from "react";
import {
  CaretDown,
  CaretUp,
  Lock,
  Clock,
  PushPinIcon,
  InfoIcon,
  VideoCamera,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  type: "video" | "quiz" | "read" | "informational";
  duration?: string;
  locked?: boolean;
}

interface Module {
  id: string;
  title: string;
  isActive: boolean;
  lessons?: Lesson[];
}

interface LearningCardProps {
  title: string;
  type: "course" | "skill-path";
  progress: number;
  description?: string;
  icon?: string;
  lessons?: Lesson[];
  modules?: Module[];
  courseId?: string;
  isPinned?: boolean;
  isLoadingModules?: boolean;
  onExpand?: (courseId: string) => void;
}

export function LearningCard({
  title,
  progress,
  description,
  icon,
  lessons = [],
  modules = [],
  courseId,
  isLoadingModules = false,
  onExpand,
}: LearningCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasModules = modules.length > 0;

  const handleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // Se está expandindo, não tem módulos carregados e tem courseId, carrega o roadmap
    if (newExpandedState && !hasModules && courseId && onExpand) {
      onExpand(courseId);
    }
  };

  return (
    <div
      className={`border border-[#25252A] rounded-[20px] overflow-hidden transition-colors ${
        isExpanded ? "bg-gray-gradient-second" : "bg-gray-gradient"
      }`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            {icon && (
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={icon}
                  alt={title}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {/* {isPinned && (
                  <PushPinIcon
                    size={16}
                    weight="fill"
                    className="text-[#00C8FF]"
                  />
                )} */}
                {/* <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-sm">
                  ReactJS
                </span> */}
              </div>
              <h3 className="text-base font-semibold text-white line-clamp-2">
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleExpand}
            className="ml-2 flex-shrink-0 text-[#C4C4CC] hover:text-white transition-colors"
          >
            {isExpanded ? <CaretUp size={20} /> : <CaretDown size={20} />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#C4C4CC]">
            <span>{progress}% Complete</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-[#25252A] p-4  pt-6 bg-[#0F0F0F]">
          {description && (
            <h4 className="text-sm font-semibold text-white mb-3">
              {description}
            </h4>
          )}

          {/* Loading state */}
          {isLoadingModules && !hasModules && (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground text-sm">
                Carregando módulos...
              </p>
            </div>
          )}

          {/* Modules List */}
          {hasModules && !isLoadingModules && (
            <div className="space-y-4 p-0">
              {modules.map((module) => (
                <div key={module.id} className="space-y-2">
                  <h5
                    className={`text-sm font-semibold ${
                      module.isActive ? "text-[#00C8FF]" : "text-[#C4C4CC]"
                    }`}
                  >
                    {module.title}
                    {module.isActive && (
                      <span className="ml-2 text-xs text-[#00C8FF]">
                        (Ativo)
                      </span>
                    )}
                  </h5>

                  {/* Lessons do módulo ativo */}
                  {module.isActive &&
                    module.lessons &&
                    module.lessons.length > 0 && (
                      <div className="space-y-2 ml-0 mt-2">
                        {module.lessons.map((lesson: Lesson) => (
                          <div
                            key={lesson.id}
                            className={`
                            flex items-center gap-3 p-3 rounded-lg
                            ${
                              lesson.locked
                                ? "bg-[#1A1A1E] opacity-50"
                                : "bg-[#25252A] hover:bg-[#2E2E32] cursor-pointer transition-colors"
                            }
                          `}
                          >
                            {lesson.locked ? (
                              <div className="w-10 h-10 rounded-lg bg-[#1A1A1E] flex items-center justify-center flex-shrink-0">
                                <Lock
                                  size={20}
                                  className="text-[#C4C4CC] flex-shrink-0"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#1A1A1E] flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-[#C4C4CC]">
                                  {lesson.type === "video" ? (
                                    <VideoCamera size={20} weight="regular" />
                                  ) : lesson.type === "quiz" ? (
                                    "?"
                                  ) : lesson.type === "read" ? (
                                    "📄"
                                  ) : (
                                    <InfoIcon size={20} weight="regular" />
                                  )}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#C4C4CC] uppercase">
                                  {lesson.type}
                                </span>
                                {lesson.duration && (
                                  <div className="flex items-center gap-1 text-[#C4C4CC]">
                                    <Clock size={12} />
                                    <span className="text-xs">
                                      {lesson.duration}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p
                                className={`
                              text-sm mt-1
                              ${lesson.locked ? "text-[#C4C4CC]" : "text-white"}
                            `}
                              >
                                {lesson.title}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {/* Lessons List (compatibilidade - quando não tem módulos) */}
          {!hasModules && lessons.length > 0 && !isLoadingModules && (
            <div className="space-y-2 p-4">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg
                    ${
                      lesson.locked
                        ? "bg-[#1A1A1E] opacity-50"
                        : "bg-[#25252A] hover:bg-[#2E2E32] cursor-pointer transition-colors"
                    }
                  `}
                >
                  {lesson.locked ? (
                    <div className="w-10 h-10 rounded-lg bg-[#1A1A1E] flex items-center justify-center flex-shrink-0">
                      <Lock
                        size={20}
                        className="text-[#C4C4CC] flex-shrink-0"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#1A1A1E] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-[#C4C4CC]">
                        {lesson.type === "video" ? (
                          <VideoCamera size={20} weight="regular" />
                        ) : lesson.type === "quiz" ? (
                          "?"
                        ) : lesson.type === "read" ? (
                          "📄"
                        ) : (
                          <InfoIcon size={20} weight="regular" />
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#C4C4CC] uppercase">
                        {lesson.type}
                      </span>
                      {lesson.duration && (
                        <div className="flex items-center gap-1 text-[#C4C4CC]">
                          <Clock size={12} />
                          <span className="text-xs">{lesson.duration}</span>
                        </div>
                      )}
                    </div>
                    <p
                      className={`
                      text-sm mt-1
                      ${lesson.locked ? "text-[#C4C4CC]" : "text-white"}
                    `}
                    >
                      {lesson.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#25252A]">
            <button className="flex items-center gap-2 text-sm text-[#C4C4CC] hover:text-white transition-colors hover:bg-[#25252A] rounded-lg p-2">
              <PushPinIcon size={16} weight="regular" />
              <span>Pin to top</span>
            </button>
            <div className="flex items-center gap-3">
              <Link href="/learn/paths/react-js">
                <button className="text-sm text-[#00C8FF] hover:underline">
                  View syllabus
                </button>
              </Link>
              <Button className="bg-blue-gradient-500 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg">
                Continuar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
