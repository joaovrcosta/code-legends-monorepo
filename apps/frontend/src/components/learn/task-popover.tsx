"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from "@/components/ui/popover";
import Image from "next/image";
import { reactCourseData, Task } from "../../../db";
import { PrimaryButton } from "../ui/primary-button";
import { FastForward, Lock } from "@phosphor-icons/react/dist/ssr";
import { CirclePlay } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCourseModalStore } from "@/stores/course-modal-store";

const firstIncompleteTask =
  reactCourseData.courseModules[0].submodules[0].tasks.find(
    (task) => !task.completed
  )?.id ?? null;

export const TaskPopover = ({
  task,
  openPopover,
  togglePopover,
  showContinue,
  setShowContinue,
}: {
  task: Task;
  openPopover: number | null;
  togglePopover: (id: number) => void;
  showContinue: boolean;
  setShowContinue: (state: boolean) => void;
}) => {
  const { setTaskForPage } = useCourseModalStore();
  const router = useRouter();

  return (
    <div>
      {showContinue && firstIncompleteTask === task.id ? (
        <Popover open={true}>
          <PopoverTrigger asChild>
            <Image
              src={task.image}
              alt=""
              className="cursor-pointer"
              onClick={() => {
                setShowContinue(false);
                togglePopover(task.id);
              }}
            />
          </PopoverTrigger>
          <PopoverContent
            className="w-[120px] cursor-pointer text-center bg-[#121214] rounded-full border-[2px] border-[#25252A] shadow-lg p-2 hover:bg-[#25252A]"
            side="top"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-white text-sm font-semibold">
                Continuar
              </span>
            </div>
            <PopoverArrow className="fill-[#25252A] mb-3 w-4 h-4 transform translate-y-[-2px]" />
          </PopoverContent>
        </Popover>
      ) : (
        <Popover open={openPopover === task.id}>
          <PopoverTrigger asChild>
            <Image
              src={task.image}
              alt=""
              className="cursor-pointer"
              onClick={() => togglePopover(task.id)}
            />
          </PopoverTrigger>
          <PopoverContent className="w-[295px] bg-[#1a1a1e] rounded-[20px] border border-[#25252A] shadow-lg p-4">
            <div className="mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-xs">
                  {task.category}
                </span>
                <span className="text-xs text-[#7e7e89] capitalize">
                  {task.type}
                </span>
              </div>
              <h3 className="text-xl mt-2 text-white">{task.title}</h3>
            </div>

            <PrimaryButton
              disabled={task.locked}
              onClick={() => {
                if (!task.locked) {
                  // Atualiza a store sem abrir o modal e navega para a página
                  setTaskForPage(task);
                  router.push("/classroom");
                }
              }}
            >
              {task.locked ? "Confidencial" : "Assistir"}
              {task.locked ? <Lock /> : <CirclePlay />}
            </PrimaryButton>

            {(task.type === "project" || task.type === "quiz") && (
              <Link href={`/skip-task/${task.id}`}>
                <PrimaryButton className="mt-2" disabled={task.locked}>
                  Pular
                  <FastForward size={24} weight="fill" />
                </PrimaryButton>
              </Link>
            )}

            <PopoverArrow className="fill-[#1a1a1e] w-4 h-4 transform translate-y-[-2px]" />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
