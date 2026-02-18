"use server";

import { updateLesson } from "./update-lesson";

export interface ReorderLessonsData {
    lessonId: number;
    order: number;
}

/**
 * Reordena múltiplas aulas atualizando seus campos order
 */
export async function reorderLessons(
    lessons: ReorderLessonsData[],
    token: string
): Promise<void> {
    try {
        // Atualizar todas as aulas em paralelo
        await Promise.all(
            lessons.map(({ lessonId, order }) =>
                updateLesson(lessonId.toString(), { order }, token)
            )
        );
    } catch (error) {
        console.error("Erro ao reordenar aulas:", error);
        throw error instanceof Error
            ? error
            : new Error("Erro ao reordenar aulas");
    }
}
