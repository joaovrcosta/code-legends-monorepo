import { Course } from "@/types/course-types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  Article,
  Brain,
  CheckCircle,
  Circle,
  Lock,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface CourseContentList {
  course: Course | null;
  pathName: string;
}

export function CourseContentList({ course, pathName }: CourseContentList) {
  return (
    <ul className="">
      {course?.modules.map((module) => (
        <li key={module.name}>
          <div className="p-4 border-b border-[#25252A] shadow-xl">
            <span className="text-xs text-[#666c6f]">{module.nivel}</span>
            <span className="block text-base font-semibold text-[#C4C4CC] whitespace-nowrap">
              {module.name}
            </span>
          </div>

          <ul>
            {module.submodules.map((submodule) => (
              <Accordion
                key={submodule.name}
                type="multiple"
                defaultValue={["1"]}
              >
                <AccordionItem value="1" className="border-b border-[#25252A]">
                  <AccordionTrigger className="px-4 py-2 cursor-pointer">
                    <span className="bg-blue-gradient-500 bg-clip-text text-transparent text-xs whitespace-nowrap">
                      {submodule.name}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="mt-1">
                    <ul>
                      {submodule.tasks.map((task) => {
                        const isActive =
                          pathName ===
                            `/classroom/react-js/lessons/${task.slug}` ||
                          pathName === `${task.url}`;

                        return (
                          <li key={task.id}>
                            <Link
                              href={
                                task.locked
                                  ? "#"
                                  : task.type === "article"
                                  ? task.url || "#"
                                  : `/classroom/react-js/lessons/${task.slug}`
                              }
                              className={`flex items-center h-[52px] px-4 transition-colors hover:bg-zinc-900 ${
                                isActive
                                  ? "bg-blue-gradient-500 text-white font-semibold"
                                  : task.locked
                                  ? "text-gray-500 cursor-not-allowed"
                                  : "text-[#C4C4CC] bg-[#1A1A1E] hover:bg-[#2E2E32]"
                              }`}
                            >
                              <span className="mr-2">
                                {task.locked ? (
                                  <Lock size={16} />
                                ) : task.completed ? (
                                  <CheckCircle
                                    size={16}
                                    weight="fill"
                                    className="text-[#00a277]"
                                  />
                                ) : task.type === "video" ? (
                                  <Circle size={16} weight="bold" />
                                ) : task.type === "quiz" ? (
                                  <Brain size={16} weight="fill" />
                                ) : task.type === "article" ? (
                                  <Article size={16} weight="fill" />
                                ) : null}
                              </span>

                              <div className="flex flex-col">
                                <span className="text-[12px] text-white font-semibold whitespace-nowrap">
                                  {task.title}
                                </span>
                                <span className="text-xs text-[#CCCCCC] whitespace-nowrap">
                                  {task.video_duration}
                                </span>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
