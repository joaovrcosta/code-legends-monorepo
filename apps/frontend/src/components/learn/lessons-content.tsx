"use client";

import DividerWithText from "@/components/divider-with-text";
import type { RoadmapResponse } from "@/types/roadmap";
import type { ActiveCourse } from "@/types/user-course.ts";
import { LessonPopover } from "@/components/learn/lesson-popover";
import type { Lesson } from "@/types/roadmap";

interface LessonsContentProps {
  roadmap: RoadmapResponse;
  activeCourse: ActiveCourse;
  openPopover: number | null;
  togglePopover: (id: number) => void;
  showContinue: boolean;
  setShowContinue: (show: boolean) => void;
  firstIncompleteLesson: Lesson | undefined;
  allLessons: Lesson[];
  taskRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
}

export function LessonsContent({
  roadmap,
  activeCourse,
  openPopover,
  togglePopover,
  showContinue,
  setShowContinue,
  firstIncompleteLesson,
  allLessons,
  taskRefs,
}: LessonsContentProps) {
  const isLessonCompleted = (status: string) => status === "completed";
  const isLessonLocked = (status: string) => status === "locked";


  // Filtra apenas o módulo atual para exibir na página /learn
  const currentModuleNumber = roadmap?.course.currentModule ?? 1;
  const currentModuleToDisplay = roadmap?.modules?.find(
    (_, index) => index + 1 === currentModuleNumber
  ) || roadmap?.modules?.[0];

  // Se não houver módulo atual, não renderiza nada
  if (!currentModuleToDisplay) {
    return null;
  }

  // Encontra o próximo módulo (se houver) para mostrar como bloqueado
  // currentModuleNumber é 1-based, então o próximo módulo está no índice currentModuleNumber (0-based)
  const nextModuleIndex = currentModuleNumber;
  const _nextModule = roadmap?.modules?.[nextModuleIndex];

  return (
    <div className="lg:pb-14 pb-0 w-full lg:mt-0 md:mt-0 mt-40">
      <section className="space-y-12 px-4 mb-12 mt-4">
        {/* Renderiza apenas o módulo atual */}
        <div key={currentModuleToDisplay.id}>
          {currentModuleToDisplay?.groups?.map(
            (group, groupIndex) =>
              group?.lessons &&
              group.lessons.length > 0 && (
                <div
                  key={group.id}
                  className="flex flex-col items-center justify-center w-full"
                >
                  <DividerWithText text={group.title} />
                  {group.lessons?.map((lesson, lessonIndex) => {
                    const isLeft = lessonIndex % 2 === 0;
                    const completed = isLessonCompleted(lesson.status);
                    const locked = isLessonLocked(lesson.status);
                    // Verifica se é a primeira lição do módulo (primeira do primeiro grupo do módulo)
                    const isFirstInModule =
                      groupIndex === 0 && lessonIndex === 0;

                    return (
                      <div
                        key={lesson.id}
                        className="max-w-[420px] mb-4"
                        ref={(el) => {
                          taskRefs.current[lesson.id] = el;
                        }}
                      >
                        <div className="flex items-center justify-center mb-6 max-w-[384px] w-full">
                          {isLeft && (
                            <div
                              className={`h-[46px] lg:w-[256px] w-[212px] rounded-tl-[55px] border-t border-l flex-shrink-0 self-center translate-y-[20px] ${completed
                                ? "border-[#00C8FF]"
                                : "border-[#25252A]"
                                }`}
                            />
                          )}
                          <div className="flex-shrink-0 flex items-center justify-center">
                            <LessonPopover
                              lesson={lesson}
                              openPopover={openPopover}
                              togglePopover={togglePopover}
                              showContinue={
                                showContinue &&
                                firstIncompleteLesson?.id === lesson.id
                              }
                              setShowContinue={setShowContinue}
                              completed={completed}
                              locked={locked}
                              currentCourseSlug={activeCourse.slug}
                              allLessons={allLessons}
                              roadmap={roadmap}
                              isFirstInModule={isFirstInModule}
                            />
                          </div>
                          {!isLeft && (
                            <div
                              className={`h-[46px] lg:w-[256px] w-[212px] rounded-tr-[55px] border-t border-r flex-shrink-0 self-center translate-y-[20px] ${completed
                                ? "border-[#00C8FF]"
                                : "border-[#25252A]"
                                }`}
                            ></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
          )}
          {/* {nextModule &&
            !currentModuleToDisplay.isCompleted && (
              <div className="w-full flex items-center justify-center mt-12">
                <section className="flex items-center justify-center p-8 border border-[#25252A] rounded-[20px] flex-col space-y-3 max-w-[384px] w-full">
                  <p className="text-sm text-center text-muted-foreground">
                    Módulo {nextModuleIndex + 1}
                  </p>
                  <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-center">
                    {nextModule.title}
                  </span>
                  <PrimaryButton disabled>
                    Módulo bloqueado <Lock />
                  </PrimaryButton>
                </section>
              </div>
            )} */}
        </div>
      </section>
    </div>
  );
}
