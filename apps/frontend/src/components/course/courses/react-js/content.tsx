import { reactCourseData } from "../../../../../db";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Brain,
  CheckCircle,
  PuzzlePiece,
  VideoCamera,
} from "@phosphor-icons/react/dist/ssr";
import { Lock, Play } from "lucide-react";
import Link from "next/link";

export function CourseContent() {
  return (
    <div className="mt-8">
      {reactCourseData.courseModules.map((course, index) => (
        <section
          key={index}
          className={`mb-4 ${
            course.locked ? "opacity-50 pointer-events-none select-none" : ""
          }`}
        >
          <span
            className={
              course.locked
                ? "text-gray-500"
                : "bg-blue-gradient-500 bg-clip-text text-transparent"
            }
          >
            {course.level}
          </span>

          <Accordion type="single" collapsible>
            <AccordionItem
              value="course"
              className="border border-[#25252A] rounded-3xl p-4 mt-4 gap-4 hover:bg-[#17171a] transition-all ease-in-out duration-150 shadow-lg relative overflow-hidden"
            >
              {/* Barra de progresso inferior */}
              <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#25252A] rounded-b-3xl">
                <div
                  className="h-full bg-[#004E63] rounded-b-3xl transition-all ease-in-out duration-300"
                  style={{ width: `${course.progress}%` }}
                />
              </div>

              <AccordionTrigger>
                <div className="flex items-center gap-4 w-full">
                  <Link
                    href="/classroom/react-js/chapter-1"
                    className={`flex items-center justify-center rounded-full h-[70px] w-[70px] border-[3px] ${
                      course.locked
                        ? "border-gray-600 cursor-not-allowed"
                        : "border-[#00C8FF] cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-center h-[70px] w-[70px] hover:bg-[#00C8FF] rounded-full hover:text-[#17171a] transition-all duration-300 hover:shadow-[0_0_12px_#00C8FF]">
                      <Play className={course.locked ? "text-gray-500" : ""} />
                    </div>
                  </Link>
                  <div className="flex flex-col justify-between space-y-4 w-full">
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-bold text-2xl ${
                          course.locked
                            ? "text-gray-600 text-lg"
                            : "bg-blue-gradient-500 bg-clip-text text-transparent text-lg"
                        }`}
                      >
                        {course.moduleName}
                      </span>
                      <div
                        className={`lg:block hidden flex flex-col justify-start items-start ${
                          course.locked ? "text-gray-500" : ""
                        }`}
                      >
                        <div className="flex space-x-2 items-center">
                          {course.tags.map((info, index) => (
                            <div
                              key={index}
                              className="px-2 border border-[#25252A] rounded-lg hover:bg-[#25252A] cursor-pointer"
                            >
                              <p className="text-sm text-[#c4c4cc]">{info}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {course.locked ? (
                        <Lock className="text-gray-500" />
                      ) : course.progress === 100 ? (
                        <>
                          <CheckCircle
                            size={28}
                            weight="fill"
                            className="text-[#00A277]"
                          />
                          <p>Completo</p>
                        </>
                      ) : (
                        <p>{`${course.progress}% completo`}</p>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t border-[#25252A] py-4">
                <div className="flex flex-col gap-2">
                  {course.submodules.map((submodule, submoduleIndex) => (
                    <div key={submoduleIndex} className="flex flex-col gap-2">
                      {/* Nome do Submódulo */}
                      <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent py-2">
                        {submodule.submoduleName}
                      </span>

                      {/* Listagem das Tarefas */}
                      {submodule.tasks.map((task, taskIndex) => (
                        <div
                          key={taskIndex}
                          className="flex items-center gap-4 p-2 hover:bg-[#25252A] rounded-lg hover:text-[#00C8FF] cursor-pointer"
                        >
                          {task.completed ? (
                            <CheckCircle
                              size={20}
                              weight="fill"
                              className="text-[#00C8FF]"
                            />
                          ) : task.type === "video" ? (
                            <VideoCamera size={20} />
                          ) : task.type === "quiz" ? (
                            <Brain size={20} />
                          ) : task.type === "projeto" ? (
                            <PuzzlePiece size={20} />
                          ) : null}

                          <div className="w-[50px] flex items-center justify-start ml-1">
                            <p className="text-[#949499]">{task.type}</p>
                          </div>
                          <p>{task.title}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      ))}
    </div>
  );
}
