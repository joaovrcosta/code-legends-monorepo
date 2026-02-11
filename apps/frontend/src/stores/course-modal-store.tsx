// store/courseModalStore.ts
import { create } from "zustand";
import type { Lesson, LessonStatus, LessonType } from "@/types/roadmap";
import type { Task } from "../../db";

interface CourseModalStore {
  isOpen: boolean;
  lessons: Lesson[];
  currentIndex: number;
  openModalWithLessons: (lessons: Lesson[], startIndex?: number) => void;
  closeModal: () => void;
  goToNextLesson: () => void;
  goToPreviousLesson: () => void;
  openModalWithLesson: (lesson: Lesson) => void;
  openModalWithTask: (task: Task) => void;
  setLessonsForPage: (lessons: Lesson[], startIndex?: number) => void;
  setLessonForPage: (lesson: Lesson) => void;
  setTaskForPage: (task: Task) => void;
  currentLesson: Lesson | null;
  updateCurrentLessonStatus: (status: LessonStatus) => void;
  lessonCompletedTimestamp: number | null;
  moduleUnlockedTimestamp: number | null;
  setModuleUnlockedTimestamp: () => void;
}

export const useCourseModalStore = create<CourseModalStore>((set, get) => ({
  isOpen: false,
  lessons: [],
  currentIndex: 0,
  currentLesson: null,
  lessonCompletedTimestamp: null,
  moduleUnlockedTimestamp: null,
  setModuleUnlockedTimestamp: () =>
    set({ moduleUnlockedTimestamp: Date.now() }),

  openModalWithLessons: (lessons, startIndex = 0) =>
    set({
      isOpen: true,
      lessons,
      currentIndex: startIndex,
      currentLesson: lessons[startIndex],
    }),

  closeModal: () =>
    set({
      isOpen: false,
      lessons: [],
      currentIndex: 0,
      currentLesson: null,
    }),

  goToNextLesson: () => {
    const { currentIndex, lessons, currentLesson } = get();
    // Só permite navegar se a aula atual estiver completa
    if (currentLesson?.status !== "completed") {
      return;
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex < lessons.length) {
      set({
        currentIndex: nextIndex,
        currentLesson: lessons[nextIndex],
      });
    }
  },

  goToPreviousLesson: () => {
    const { currentIndex, lessons } = get();
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      set({
        currentIndex: prevIndex,
        currentLesson: lessons[prevIndex],
      });
    }
  },

  openModalWithLesson: (lesson: Lesson) =>
    set({
      isOpen: true,
      lessons: [lesson],
      currentIndex: 0,
      currentLesson: lesson,
    }),

  openModalWithTask: (task: Task) => {
    // Converte Task para Lesson
    const lesson: Lesson = {
      id: task.id,
      title: task.title,
      slug: `task-${task.id}`, // Gera um slug baseado no ID
      description: task.category || "",
      type: (task.type as LessonType) || "video",
      video_url: task.videoUrl || "",
      video_duration: "",
      order: task.id,
      status: task.locked
        ? "locked"
        : task.completed
        ? "completed"
        : "unlocked",
      isCurrent: false,
      canReview: false,
    };

    set({
      isOpen: true,
      lessons: [lesson],
      currentIndex: 0,
      currentLesson: lesson,
    });
  },

  // Funções para atualizar as aulas sem abrir o modal (para navegação para página)
  setLessonsForPage: (lessons, startIndex = 0) =>
    set({
      isOpen: false, // Não abre o modal
      lessons,
      currentIndex: startIndex,
      currentLesson: lessons[startIndex],
    }),

  setLessonForPage: (lesson: Lesson) =>
    set({
      isOpen: false, // Não abre o modal
      lessons: [lesson],
      currentIndex: 0,
      currentLesson: lesson,
    }),

  setTaskForPage: (task: Task) => {
    // Converte Task para Lesson
    const lesson: Lesson = {
      id: task.id,
      title: task.title,
      slug: `task-${task.id}`,
      description: task.category || "",
      type: (task.type as LessonType) || "video",
      video_url: task.videoUrl || "",
      video_duration: "",
      order: task.id,
      status: task.locked
        ? "locked"
        : task.completed
        ? "completed"
        : "unlocked",
      isCurrent: false,
      canReview: false,
    };

    set({
      isOpen: false, // Não abre o modal
      lessons: [lesson],
      currentIndex: 0,
      currentLesson: lesson,
    });
  },

  updateCurrentLessonStatus: (status: LessonStatus) => {
    const { currentLesson, lessons, currentIndex } = get();
    if (currentLesson) {
      const updatedLesson = { ...currentLesson, status };
      const updatedLessons = [...lessons];
      updatedLessons[currentIndex] = updatedLesson;
      const updates: Partial<CourseModalStore> = {
        currentLesson: updatedLesson,
        lessons: updatedLessons,
      };

      // Se a lição foi marcada como concluída, atualiza o timestamp
      if (status === "completed" && currentLesson.status !== "completed") {
        updates.lessonCompletedTimestamp = Date.now();

        // Desbloqueia a próxima lição se estiver locked
        const nextIndex = currentIndex + 1;
        if (nextIndex < updatedLessons.length) {
          const nextLesson = updatedLessons[nextIndex];
          if (nextLesson.status === "locked") {
            updatedLessons[nextIndex] = { ...nextLesson, status: "unlocked" };
            updates.lessons = updatedLessons;
          }
        }
      }

      set(updates);
    }
  },
}));
