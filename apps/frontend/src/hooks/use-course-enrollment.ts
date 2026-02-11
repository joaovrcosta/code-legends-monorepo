import { useState, useEffect } from "react";
import { getUserEnrolledList } from "@/actions/progress/get-user-enrolled-list";

interface UseCourseEnrollmentReturn {
  isEnrolled: boolean;
  isLoading: boolean;
  isCheckingEnrollment: boolean;
  handleStartCourse: (
    courseId: string,
    redirectPath?: string
  ) => Promise<string | undefined>;
}

/**
 * Hook reutilizável para gerenciar inscrição e início de curso
 */
export function useCourseEnrollment(courseId: string): UseCourseEnrollmentReturn {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Garante que o componente está montado no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Verifica se o usuário está inscrito no curso
  useEffect(() => {
    if (!mounted) return;
    
    async function checkEnrollment() {
      try {
        const { userCourses } = await getUserEnrolledList();
        const enrolled = userCourses.some(
          (enrolledCourse) => enrolledCourse.courseId === courseId
        );
        setIsEnrolled(enrolled);
      } catch (error) {
        console.error("Erro ao verificar inscrição:", error);
        setIsEnrolled(false);
      } finally {
        setIsCheckingEnrollment(false);
      }
    }
    
    checkEnrollment();
  }, [courseId, mounted]);

  /**
   * Inicia o curso (faz enroll se necessário e depois start)
   * Retorna o redirectPath para que o componente possa fazer o redirecionamento
   */
  const handleStartCourse = async (
    courseId: string,
    redirectPath?: string
  ): Promise<string | undefined> => {
    try {
      setIsLoading(true);

      // Se não estiver inscrito, faz enroll primeiro
      if (!isEnrolled) {
        const { enrollInCourse } = await import("@/actions/course/enroll");
        await enrollInCourse(courseId);
        setIsEnrolled(true);
      }

      // Inicia o curso (define como ativo)
      const { startCourse } = await import("@/actions/course/start");
      await startCourse(courseId);

      // Retorna o caminho para redirecionamento
      return redirectPath;
    } catch (error) {
      console.error("Erro ao iniciar curso:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isEnrolled,
    isLoading,
    isCheckingEnrollment,
    handleStartCourse,
  };
}
