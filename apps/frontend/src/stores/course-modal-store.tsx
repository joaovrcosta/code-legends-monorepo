// store/courseModalStore.ts
import { create } from 'zustand'
import type { RoadmapLesson, LessonStatus, LessonType } from '@/types/roadmap'
import { playLessonCompleteSuccess } from '@/lib/play-correct-chime'
import type { Task } from '../../db'

interface ModuleCompletionInfo {
  moduleCompleted: boolean
  moduleId?: string
  moduleTitle?: string
  progress?: number
  xpGained?: number
  xpGainedInModule?: number
  xpGainedInModuleBySkill?: { skillId: string; xp: number }[]
}

interface CourseModalStore {
  isOpen: boolean
  lessons: RoadmapLesson[]
  currentIndex: number
  openModalWithLessons: (lessons: RoadmapLesson[], startIndex?: number) => void
  closeModal: () => void
  goToNextLesson: () => void
  goToPreviousLesson: () => void
  openModalWithLesson: (lesson: RoadmapLesson) => void
  openModalWithTask: (task: Task) => void
  setLessonsForPage: (lessons: RoadmapLesson[], startIndex?: number) => void
  setLessonForPage: (lesson: RoadmapLesson) => void
  setTaskForPage: (task: Task) => void
  /** Sala de aula: paywall / upgrade — não há `currentLesson` novo, mas o header deve mostrar “Aula exclusiva”. */
  exclusiveAccessBlocked: boolean
  setExclusiveAccessBlocked: (blocked: boolean) => void
  currentLesson: RoadmapLesson | null
  updateCurrentLessonStatus: (status: LessonStatus) => void
  lessonCompletedTimestamp: number | null
  moduleUnlockedTimestamp: number | null
  setModuleUnlockedTimestamp: () => void
  lastModuleCompletion: ModuleCompletionInfo | null
  setLastModuleCompletion: (info: ModuleCompletionInfo | null) => void
  showModuleStatsOnce: boolean
  setShowModuleStatsOnce: (value: boolean) => void
  /** Multi quiz: bloqueia “Próxima” até XP carregar (ou 0 XP após salvar). */
  multiQuizBlocksNextLesson: boolean
  setMultiQuizBlocksNextLesson: (blocked: boolean) => void
}

export const useCourseModalStore = create<CourseModalStore>((set, get) => ({
  isOpen: false,
  lessons: [],
  currentIndex: 0,
  currentLesson: null,
  lessonCompletedTimestamp: null,
  moduleUnlockedTimestamp: null,
  lastModuleCompletion: null,
  showModuleStatsOnce: false,
  multiQuizBlocksNextLesson: false,
  exclusiveAccessBlocked: false,
  setExclusiveAccessBlocked: (blocked) =>
    set({ exclusiveAccessBlocked: blocked }),
  setMultiQuizBlocksNextLesson: (blocked) =>
    set({ multiQuizBlocksNextLesson: blocked }),
  setModuleUnlockedTimestamp: () =>
    set({ moduleUnlockedTimestamp: Date.now() }),
  setLastModuleCompletion: (info) => set({ lastModuleCompletion: info }),
  setShowModuleStatsOnce: (value) => set({ showModuleStatsOnce: value }),

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
      multiQuizBlocksNextLesson: false,
      exclusiveAccessBlocked: false,
    }),

  goToNextLesson: () => {
    const { currentIndex, lessons, currentLesson } = get()
    // Só permite navegar se a aula atual estiver completa
    if (currentLesson?.status !== 'completed') {
      return
    }
    const nextIndex = currentIndex + 1
    if (nextIndex < lessons.length) {
      set({
        currentIndex: nextIndex,
        currentLesson: lessons[nextIndex],
      })
    }
  },

  goToPreviousLesson: () => {
    const { currentIndex, lessons } = get()
    const prevIndex = currentIndex - 1
    if (prevIndex >= 0) {
      set({
        currentIndex: prevIndex,
        currentLesson: lessons[prevIndex],
      })
    }
  },

  openModalWithLesson: (lesson: RoadmapLesson) =>
    set({
      isOpen: true,
      lessons: [lesson],
      currentIndex: 0,
      currentLesson: lesson,
    }),

  openModalWithTask: (task: Task) => {
    const lesson: RoadmapLesson = {
      id: task.id,
      title: task.title,
      slug: `task-${task.id}`,
      description: task.category || '',
      type: (task.type as LessonType) || 'video',
      video_duration: '',
      order: task.id,
      status: task.locked
        ? 'locked'
        : task.completed
          ? 'completed'
          : 'unlocked',
      isCurrent: false,
      canReview: false,
    }

    set({
      isOpen: true,
      lessons: [lesson],
      currentIndex: 0,
      currentLesson: lesson,
    })
  },

  // Funções para atualizar as aulas sem abrir o modal (para navegação para página)
  setLessonsForPage: (lessons, startIndex = 0) =>
    set({
      isOpen: false, // Não abre o modal
      lessons,
      currentIndex: startIndex,
      currentLesson: lessons[startIndex],
      exclusiveAccessBlocked: false,
    }),

  setLessonForPage: (lesson: RoadmapLesson) =>
    set({
      isOpen: false, // Não abre o modal
      lessons: [lesson],
      currentIndex: 0,
      currentLesson: lesson,
      exclusiveAccessBlocked: false,
    }),

  setTaskForPage: (task: Task) => {
    const lesson: RoadmapLesson = {
      id: task.id,
      title: task.title,
      slug: `task-${task.id}`,
      description: task.category || '',
      type: (task.type as LessonType) || 'video',
      video_duration: '',
      order: task.id,
      status: task.locked
        ? 'locked'
        : task.completed
          ? 'completed'
          : 'unlocked',
      isCurrent: false,
      canReview: false,
    }

    set({
      isOpen: false, // Não abre o modal
      lessons: [lesson],
      currentIndex: 0,
      currentLesson: lesson,
    })
  },

  updateCurrentLessonStatus: (status: LessonStatus) => {
    const { currentLesson, lessons, currentIndex } = get()
    if (currentLesson) {
      const updatedLesson = { ...currentLesson, status }
      const updatedLessons = [...lessons]
      updatedLessons[currentIndex] = updatedLesson
      const updates: Partial<CourseModalStore> = {
        currentLesson: updatedLesson,
        lessons: updatedLessons,
      }

      // Se a lição foi marcada como concluída, atualiza o timestamp
      if (status === 'completed' && currentLesson.status !== 'completed') {
        updates.lessonCompletedTimestamp = Date.now()
        playLessonCompleteSuccess()
      }

      set(updates)
    }
  },
}))
