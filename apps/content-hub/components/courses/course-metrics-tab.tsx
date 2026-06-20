"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Award,
  BookOpenCheck,
  Heart,
  RefreshCw,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  getCourseMetrics,
  type CourseMetricsResponse,
} from "@/actions/course/get-course-metrics";
import { getAuthTokenFromClient } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CourseMetricsTabProps = {
  courseId: string;
  enabled: boolean;
};

type MetricCard = {
  title: string;
  value: string;
  description: string;
  icon: typeof Users;
  iconClassName: string;
};

function buildMetricCards(metrics: CourseMetricsResponse): MetricCard[] {
  const { summary } = metrics;

  return [
    {
      title: "Matrículas",
      value: summary.enrollments.toLocaleString("pt-BR"),
      description: "Alunos inscritos no curso",
      icon: Users,
      iconClassName: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Conclusões",
      value: summary.completions.toLocaleString("pt-BR"),
      description: "Alunos que finalizaram o curso",
      icon: BookOpenCheck,
      iconClassName: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Taxa de conclusão",
      value: `${summary.completionRate}%`,
      description: "Conclusões sobre matrículas",
      icon: TrendingUp,
      iconClassName: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Progresso médio",
      value: `${summary.averageProgress}%`,
      description: "Média de progresso entre inscritos",
      icon: TrendingUp,
      iconClassName: "text-violet-600 dark:text-violet-400",
    },
    {
      title: "Favoritos",
      value: summary.favorites.toLocaleString("pt-BR"),
      description: "Alunos que favoritaram o curso",
      icon: Star,
      iconClassName: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Certificados",
      value: summary.certificates.toLocaleString("pt-BR"),
      description: "Certificados emitidos para este curso",
      icon: Award,
      iconClassName: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Curtidas do curso",
      value: summary.courseLikes.toLocaleString("pt-BR"),
      description: "Reações positivas no curso",
      icon: ThumbsUp,
      iconClassName: "text-sky-600 dark:text-sky-400",
    },
    {
      title: "Descurtidas do curso",
      value: summary.courseDislikes.toLocaleString("pt-BR"),
      description: "Reações negativas no curso",
      icon: ThumbsDown,
      iconClassName: "text-rose-600 dark:text-rose-400",
    },
    {
      title: "Aulas concluídas",
      value: `${summary.lessonsCompleted.toLocaleString("pt-BR")} / ${summary.totalLessons.toLocaleString("pt-BR")}`,
      description: "Total de conclusões de aulas (todas as matrículas)",
      icon: Heart,
      iconClassName: "text-pink-600 dark:text-pink-400",
    },
  ];
}

function formatAverageRating(rating: number | null, ratingCount: number): string {
  if (rating == null || ratingCount === 0) return "—";
  return rating.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function CourseMetricsTab({ courseId, enabled }: CourseMetricsTabProps) {
  const [metrics, setMetrics] = useState<CourseMetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthTokenFromClient();
      if (!token) {
        setError("Token de autenticação não encontrado.");
        return;
      }

      const data = await getCourseMetrics(courseId, token);
      if (!data) {
        setError("Não foi possível carregar as métricas deste curso.");
        return;
      }

      setMetrics(data);
      setLoaded(true);
    } catch {
      setError("Erro inesperado ao carregar métricas.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (enabled && !loaded && !loading) {
      void loadMetrics();
    }
  }, [enabled, loaded, loading, loadMetrics]);

  if (!enabled) {
    return null;
  }

  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-2 h-3 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </CardHeader>
          <CardContent>
            <div className="h-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-300 dark:border-red-800">
        <CardContent className="flex flex-col items-start gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void loadMetrics()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  const cards = buildMetricCards(metrics);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Métricas do curso
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Engajamento, progresso e reações dos alunos neste curso.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadMetrics()}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.iconClassName}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reações por aula</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.lessonReactions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Este curso ainda não possui aulas cadastradas.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aula</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead className="text-right">Curtidas</TableHead>
                  <TableHead className="text-right">Descurtidas</TableHead>
                  <TableHead className="text-right">Nota média</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.lessonReactions.map((lesson) => (
                  <TableRow key={lesson.lessonId}>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>{lesson.moduleTitle}</TableCell>
                    <TableCell>{lesson.groupTitle}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {lesson.likes.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {lesson.dislikes.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="tabular-nums font-medium text-gray-900 dark:text-gray-100">
                        {formatAverageRating(
                          lesson.averageRating,
                          lesson.ratingCount,
                        )}
                        {lesson.ratingCount > 0 ? (
                          <span className="text-gray-500 dark:text-gray-400 font-normal">
                            {" "}
                            / 5
                          </span>
                        ) : null}
                      </div>
                      {lesson.ratingCount > 0 ? (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {lesson.ratingCount.toLocaleString("pt-BR")}{" "}
                          {lesson.ratingCount === 1 ? "nota" : "notas"}
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
