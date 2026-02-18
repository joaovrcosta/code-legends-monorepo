"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getUserOverview, type UserOverview } from "@/actions/user/get-user-overview";
import { updateUserOverview, type UpdateUserOverviewData } from "@/actions/user/update-user-overview";
import { getAuthTokenFromClient } from "@/lib/auth";
import { ArrowLeft, User, BookOpen, CheckCircle2, TrendingUp, Award, Clock, Target, Edit, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function UserOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  
  const [overview, setOverview] = useState<UserOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdateUserOverviewData>({});
  const [lessonsLimit, setLessonsLimit] = useState<number>(() => {
    const limit = searchParams.get("completedLessonsLimit");
    if (limit) {
      const num = parseInt(limit, 10);
      if (num >= 1 && num <= 500) {
        return num;
      }
    }
    return 50;
  });

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        router.push("/users");
        return;
      }
      const data = await getUserOverview(userId, token, lessonsLimit);
      if (data) {
        setOverview(data);
      } else {
        toast.error("Usuário não encontrado");
        router.push("/users");
      }
    } catch (error) {
      console.error("Erro ao carregar overview:", error);
      toast.error("Erro ao carregar overview do usuário");
      router.push("/users");
    } finally {
      setLoading(false);
    }
  }, [userId, lessonsLimit, router]);

  useEffect(() => {
    if (userId) {
      loadOverview();
    }
  }, [userId, loadOverview]);

  const handleLessonsLimitChange = (value: string) => {
    const num = parseInt(value, 10);
    if (num >= 1 && num <= 500) {
      setLessonsLimit(num);
      // Atualizar URL sem recarregar a página
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("completedLessonsLimit", num.toString());
      router.push(`/users/${userId}/overview?${newSearchParams.toString()}`, { scroll: false });
    }
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }

      // Remove campos vazios ou undefined
      const dataToSend: UpdateUserOverviewData = {};
      Object.entries(editFormData).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          dataToSend[key as keyof UpdateUserOverviewData] = value;
        }
      });

      await updateUserOverview(userId, dataToSend, token);
      setShowEditModal(false);
      loadOverview(); // Recarrega os dados
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error(error.message || "Erro ao atualizar usuário");
    } finally {
      setSaving(false);
    }
  };

  const handleExpertiseChange = (value: string) => {
    const expertiseArray = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    setEditFormData({ ...editFormData, expertise: expertiseArray });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatProgress = (progress: number) => {
    return `${(progress * 100).toFixed(1)}%`;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-900/20 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300";
      case "INSTRUCTOR":
        return "bg-blue-900/20 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300";
      case "STUDENT":
        return "bg-emerald-900/20 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300";
      default:
        return "bg-gray-900/20 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300";
    }
  };

  const getRoleDotColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-700 dark:bg-purple-400";
      case "INSTRUCTOR":
        return "bg-blue-700 dark:bg-blue-400";
      case "STUDENT":
        return "bg-emerald-700 dark:bg-emerald-400";
      default:
        return "bg-gray-700 dark:bg-gray-400";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Admin";
      case "INSTRUCTOR":
        return "Instrutor";
      case "STUDENT":
        return "Estudante";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg text-gray-600 dark:text-gray-400">Carregando...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!overview) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/users")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4 flex-1">
            {overview.user.avatar && (
              <Image
                src={overview.user.avatar}
                alt={overview.user.name}
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {overview.user.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{overview.user.email}</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditFormData({
                name: overview.user.name,
                bio: overview.user.bio,
                expertise: overview.user.expertise,
                onboardingCompleted: overview.user.onboardingCompleted,
                onboardingGoal: overview.user.onboardingGoal,
                onboardingCareer: overview.user.onboardingCareer,
                totalXp: overview.user.totalXp,
                level: overview.user.level,
                xpToNextLevel: overview.user.xpToNextLevel,
                birth_date: overview.user.birth_date,
                born_in: overview.user.born_in,
                document: overview.user.document,
                foreign_phone: overview.user.foreign_phone,
                fullname: overview.user.fullname,
                gender: overview.user.gender,
                marital_status: overview.user.marital_status,
                occupation: overview.user.occupation,
                phone: overview.user.phone,
                rg: overview.user.rg,
                address: overview.user.address,
              });
              setShowEditModal(true);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total de Cursos
              </CardTitle>
              <BookOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {overview.statistics.totalCourses}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {overview.statistics.completedCourses} completos, {overview.statistics.inProgressCourses} em progresso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Aulas Completadas
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {overview.statistics.totalLessonsCompleted}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total de aulas finalizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Nível
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Nível {overview.statistics.level}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {overview.statistics.xpToNextLevel} XP para próximo nível
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                XP Total
              </CardTitle>
              <Award className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {overview.statistics.totalXp.toLocaleString("pt-BR")}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Pontos de experiência
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Função</p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(
                    overview.user.role
                  )}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${getRoleDotColor(
                      overview.user.role
                    )}`}
                  />
                  {getRoleLabel(overview.user.role)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Onboarding</p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${
                    overview.user.onboardingCompleted
                      ? "bg-emerald-900/20 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-900/20 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      overview.user.onboardingCompleted
                        ? "bg-emerald-700 dark:bg-emerald-400"
                        : "bg-amber-700 dark:bg-amber-400"
                    }`}
                  />
                  {overview.user.onboardingCompleted ? "Completo" : "Pendente"}
                </span>
              </div>
              {overview.user.onboardingGoal && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Objetivo</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {overview.user.onboardingGoal}
                  </p>
                </div>
              )}
              {overview.user.onboardingCareer && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Carreira</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {overview.user.onboardingCareer}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Criado em</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {formatDate(overview.user.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Atualizado em</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {formatDate(overview.user.updatedAt)}
                </p>
              </div>
            </div>
            {overview.user.bio && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Bio</p>
                <p className="text-gray-900 dark:text-gray-100 mt-1">{overview.user.bio}</p>
              </div>
            )}
            {overview.user.expertise && overview.user.expertise.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {overview.user.expertise.map((exp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-900/20 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded text-xs"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Curso Ativo */}
        {overview.activeCourse && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Curso Ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {overview.activeCourse.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {overview.activeCourse.slug}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progresso</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatProgress(overview.activeCourse.progress)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${overview.activeCourse.progress * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Status</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {overview.activeCourse.isCompleted ? "Completo" : "Em Progresso"}
                    </p>
                  </div>
                  {overview.activeCourse.currentTaskId && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Tarefa Atual</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        ID: {overview.activeCourse.currentTaskId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cursos Matriculados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Cursos Matriculados ({overview.enrolledCourses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overview.enrolledCourses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nenhum curso matriculado
              </p>
            ) : (
              <div className="space-y-4">
                {overview.enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 dark:border-[#25252a] rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {course.courseTitle}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {course.courseSlug}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          course.isCompleted
                            ? "bg-emerald-900/20 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : "bg-blue-900/20 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {course.isCompleted ? "Completo" : "Em Progresso"}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatProgress(course.progress)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${course.progress * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Matriculado em</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(course.enrolledAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Último acesso</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(course.lastAccessedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aulas Completadas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Aulas Completadas ({overview.completedLessons.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="lessonsLimit" className="text-sm text-gray-600 dark:text-gray-400">
                  Limite:
                </Label>
                <Select
                  id="lessonsLimit"
                  value={lessonsLimit.toString()}
                  onChange={(e) => handleLessonsLimitChange(e.target.value)}
                  className="w-24"
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="500">500</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {overview.completedLessons.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nenhuma aula completada
              </p>
            ) : (
              <div className="space-y-3">
                {overview.completedLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="border border-gray-200 dark:border-[#25252a] rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {lesson.lessonTitle}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {lesson.courseTitle}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {lesson.lessonSlug}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        {formatDate(lesson.completedAt)}
                      </div>
                    </div>
                    {lesson.timeSpent > 0 && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Tempo gasto: {lesson.timeSpent} minutos
                      </div>
                    )}
                    {lesson.score !== null && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Pontuação: {lesson.score}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Edição */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Editar Usuário</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEditModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={editFormData.name || ""}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Nome Completo</Label>
                      <Input
                        id="fullname"
                        value={editFormData.fullname || ""}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, fullname: e.target.value || null })
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editFormData.bio || ""}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, bio: e.target.value || null })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="expertise">Expertise (separado por vírgula)</Label>
                      <Input
                        id="expertise"
                        value={editFormData.expertise?.join(", ") || ""}
                        onChange={(e) => handleExpertiseChange(e.target.value)}
                        placeholder="React, Node.js, TypeScript"
                      />
                    </div>
                  </div>
                </div>

                {/* Onboarding */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Onboarding</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="onboardingCompleted">Onboarding Completo</Label>
                      <Select
                        id="onboardingCompleted"
                        value={editFormData.onboardingCompleted?.toString() || "false"}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            onboardingCompleted: e.target.value === "true",
                          })
                        }
                      >
                        <option value="false">Não</option>
                        <option value="true">Sim</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="onboardingGoal">Objetivo</Label>
                      <Input
                        id="onboardingGoal"
                        value={editFormData.onboardingGoal || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            onboardingGoal: e.target.value || null,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="onboardingCareer">Carreira</Label>
                      <Input
                        id="onboardingCareer"
                        value={editFormData.onboardingCareer || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            onboardingCareer: e.target.value || null,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Progresso */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Progresso</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalXp">XP Total</Label>
                      <Input
                        id="totalXp"
                        type="number"
                        value={editFormData.totalXp || 0}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            totalXp: parseInt(e.target.value, 10) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Nível</Label>
                      <Input
                        id="level"
                        type="number"
                        value={editFormData.level || 1}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            level: parseInt(e.target.value, 10) || 1,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="xpToNextLevel">XP para Próximo Nível</Label>
                      <Input
                        id="xpToNextLevel"
                        type="number"
                        value={editFormData.xpToNextLevel || 0}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            xpToNextLevel: parseInt(e.target.value, 10) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Informações Pessoais */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Data de Nascimento</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={editFormData.birth_date || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            birth_date: e.target.value || null,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="born_in">Naturalidade</Label>
                      <Input
                        id="born_in"
                        value={editFormData.born_in || ""}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, born_in: e.target.value || null })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gênero</Label>
                      <Input
                        id="gender"
                        value={editFormData.gender || ""}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, gender: e.target.value || null })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marital_status">Estado Civil</Label>
                      <Input
                        id="marital_status"
                        value={editFormData.marital_status || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            marital_status: e.target.value || null,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Ocupação</Label>
                      <Input
                        id="occupation"
                        value={editFormData.occupation || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            occupation: e.target.value || null,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={editFormData.phone || ""}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, phone: e.target.value || null })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="document">Documento</Label>
                      <Input
                        id="document"
                        value={editFormData.document || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            document: e.target.value || null,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        value={editFormData.rg || ""}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, rg: e.target.value || null })
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Textarea
                        id="address"
                        value={editFormData.address || ""}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, address: e.target.value || null })
                        }
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-[#25252a]">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={saving}>
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
