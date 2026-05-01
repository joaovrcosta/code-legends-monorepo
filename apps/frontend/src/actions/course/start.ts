"use server";

import { getAuthToken } from "../auth/session";
import { revalidateTag, revalidatePath } from "next/cache";
import { getActiveCourse } from "../user/get-active-course";

/**
 * Inicia um curso
 */
export async function startCourse(courseId: string) {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    // Busca o curso ativo atual antes de mudar
    const previousActiveCourse = await getActiveCourse();
    const previousCourseId = previousActiveCourse?.id;

    const doStart = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );
      return response;
    };

    let response = await doStart();

    // Regra nova: inscrição pode ser implícita (primeira ação).
    // Se a API ainda exigir inscrição para /start, fazemos enroll e tentamos de novo.
    if (!response.ok && response.status === 403) {
      const errorData = await response.json().catch(() => ({} as any));
      const message = String(errorData?.message ?? "");
      if (message === "User is not enrolled in this course") {
        const { enrollInCourse } = await import("./enroll");
        await enrollInCourse(courseId);
        response = await doStart();
      } else {
        throw new Error(message || "Erro ao iniciar curso");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as any).message || "Erro ao iniciar curso");
    }

    const data = await response.json();

    // Invalida o cache após iniciar um novo curso
    try {
      // Invalida o cache do curso ativo
      revalidateTag("active-course");
      // Invalida o cache do roadmap do novo curso
      revalidateTag(`roadmap-${courseId}`);
      // Se havia um curso anterior, invalida o roadmap dele também
      if (previousCourseId && previousCourseId !== courseId) {
        revalidateTag(`roadmap-${previousCourseId}`);
      }
      // Revalida a página do learn para forçar atualização
      revalidatePath("/learn", "page");
      revalidatePath("/classroom", "layout");
    } catch (cacheError) {
      // Não falha a operação se houver erro ao invalidar cache
      console.warn("Erro ao invalidar cache:", cacheError);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao iniciar curso:", error);
    throw error instanceof Error ? error : new Error("Erro ao iniciar curso");
  }
}
