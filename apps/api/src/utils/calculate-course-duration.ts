import { prisma } from "../lib/prisma";


/**
 * Calcula a duração total de um curso somando todas as durações das lições
 * @param courseId ID do curso
 * @returns Duração total formatada (ex: "19h 30min" ou "30min")
 */
export async function calculateCourseTotalDuration(
    courseId: string
): Promise<string | null> {
    try {
        const modules = await prisma.module.findMany({
            where: { courseId },
            select: {
                id: true,
                submodules: {
                    select: {
                        id: true,
                        lessons: {
                            select: {
                                video: {
                                    select: { duration: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        let totalSeconds = 0;

        // Itera por todos os módulos, submodules e lições
        for (const module of modules) {
            for (const group of module.submodules) {
                for (const lesson of group.lessons) {
                    const duration = lesson.video?.duration?.trim();
                    if (duration) {

                        try {
                            // Verifica se é formato "Xm Ys" (ex: "12m 30s")
                            const minutesSecondsMatch = duration.match(/(\d+)m\s*(\d+)s/);
                            if (minutesSecondsMatch) {
                                const minutes = parseInt(minutesSecondsMatch[1], 10);
                                const seconds = parseInt(minutesSecondsMatch[2], 10);
                                if (!isNaN(minutes) && !isNaN(seconds)) {
                                    totalSeconds += minutes * 60 + seconds;
                                }
                                continue;
                            }

                            // Verifica se é formato "HH:MM:SS" ou "MM:SS"
                            const parts = duration.split(":").map(Number);
                            if (parts.length === 3 && parts.every(p => !isNaN(p))) {
                                // HH:MM:SS
                                totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
                            } else if (parts.length === 2 && parts.every(p => !isNaN(p))) {
                                // MM:SS
                                totalSeconds += parts[0] * 60 + parts[1];
                            }
                        } catch (parseError) {
                            // Ignora erros de parsing de duração individual
                            console.warn(`Erro ao parsear duração "${duration}":`, parseError);
                        }
                    }
                }
            }
        }

        // Se não há duração, retorna null
        if (totalSeconds === 0) {
            return null;
        }

        // Converte para horas e minutos
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        // Formata a saída
        if (hours > 0) {
            return `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`;
        } else if (minutes > 0) {
            return `${minutes}min`;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Erro ao calcular duração total do curso:", error);
        return null;
    }
}
