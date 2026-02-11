"use server";

export interface UserOverview {
    user: {
        id: string;
        name: string;
        avatar: string | null;
        slug: string | null;
        bio: string | null;
        expertise: string[];
        role: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        onboardingCompleted: boolean;
        onboardingGoal: string | null;
        onboardingCareer: string | null;
        totalXp: number;
        level: number;
        xpToNextLevel: number;
        birth_date: string | null;
        born_in: string | null;
        document: string | null;
        foreign_phone: string | null;
        fullname: string | null;
        gender: string | null;
        marital_status: string | null;
        occupation: string | null;
        phone: string | null;
        rg: string | null;
        address: string | null;
    };
    activeCourse: {
        id: string;
        title: string;
        slug: string;
        progress: number;
        isCompleted: boolean;
        currentModuleId: string | null;
        currentTaskId: number | null;
    } | null;
    enrolledCourses: Array<{
        id: string;
        courseId: string;
        courseTitle: string;
        courseSlug: string;
        progress: number;
        isCompleted: boolean;
        enrolledAt: string;
        lastAccessedAt: string;
        currentModuleId: string | null;
        currentTaskId: number | null;
    }>;
    completedLessons: Array<{
        id: string;
        lessonId: number;
        lessonTitle: string;
        lessonSlug: string;
        courseId: string;
        courseTitle: string;
        completedAt: string;
        timeSpent: number;
        score: number | null;
    }>;
    statistics: {
        totalCourses: number;
        completedCourses: number;
        inProgressCourses: number;
        totalLessonsCompleted: number;
        totalXp: number;
        level: number;
        xpToNextLevel: number;
    };
}

export interface UserOverviewResponse {
    user: UserOverview["user"];
    activeCourse: UserOverview["activeCourse"];
    enrolledCourses: UserOverview["enrolledCourses"];
    completedLessons: UserOverview["completedLessons"];
    statistics: UserOverview["statistics"];
}

/**
 * Busca o overview completo de um usuário
 * @param userId - ID do usuário
 * @param token - Token de autenticação
 * @param completedLessonsLimit - Quantidade máxima de aulas completadas a retornar (mín: 1, máx: 500, padrão: 50)
 */
export async function getUserOverview(
    userId: string,
    token: string,
    completedLessonsLimit?: number
): Promise<UserOverview | null> {
    if (!userId) return null;

    // Validação do limite: mínimo 1, máximo 500, padrão 50
    let limit = 50;
    if (completedLessonsLimit !== undefined) {
        if (completedLessonsLimit < 1) {
            limit = 1;
        } else if (completedLessonsLimit > 500) {
            limit = 500;
        } else {
            limit = completedLessonsLimit;
        }
    }

    try {
        const url = new URL(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/overview`
        );
        url.searchParams.append("completedLessonsLimit", limit.toString());

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error("Erro ao buscar overview do usuário");
        }

        const data: UserOverviewResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao buscar overview do usuário:", error);
        return null;
    }
}
