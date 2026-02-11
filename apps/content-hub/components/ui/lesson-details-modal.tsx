"use client";

import * as React from "react";
import { X, Clock, User, BookOpen, Lock, Unlock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LessonDetail } from "@/actions/lesson";

interface LessonDetailsModalProps {
  lesson: LessonDetail | null;
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
}

export function LessonDetailsModal({
  lesson,
  isOpen,
  onClose,
  loading = false,
}: LessonDetailsModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl">Detalhes da Aula</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-center py-8 text-gray-900 dark:text-gray-100">Carregando...</div>
          ) : !lesson ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aula não encontrada
            </div>
          ) : (
            <>
              {/* Informações Básicas */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Informações Básicas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Título</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{lesson.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Slug</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{lesson.slug}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tipo</p>
                      <p className="font-medium capitalize text-gray-900 dark:text-gray-100">{lesson.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ordem</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{lesson.order || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Descrição</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{lesson.description}</p>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {lesson.locked ? (
                      <>
                        <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">Bloqueada</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">Disponível</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {lesson.isFree ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">Gratuita</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">Paga</span>
                      </>
                    )}
                  </div>
                  {lesson.completed !== undefined && (
                    <div className="flex items-center gap-2">
                      {lesson.completed ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">Concluída</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">Não concluída</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Vídeo */}
              {lesson.type === "video" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações do Vídeo</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {lesson.video_url && (
                      <div>
                        <p className="text-sm text-gray-600">URL do Vídeo</p>
                        <a
                          href={lesson.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all"
                        >
                          {lesson.video_url}
                        </a>
                      </div>
                    )}
                    {lesson.video_duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Duração</p>
                          <p className="font-medium">{lesson.video_duration}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* URL */}
              {lesson.url && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">URL</h3>
                  <a
                    href={lesson.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {lesson.url}
                  </a>
                </div>
              )}

              {/* Autor */}
              {lesson.author && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <User className="h-5 w-5" />
                    Autor
                  </h3>
                  <div className="flex items-center gap-4">
                    {lesson.author.avatar && (
                      <img
                        src={lesson.author.avatar}
                        alt={lesson.author.name}
                        className="h-12 w-12 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{lesson.author.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.author.email}</p>
                      {lesson.author.bio && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{lesson.author.bio}</p>
                      )}
                      {lesson.author.expertise && lesson.author.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {lesson.author.expertise.map((exp, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded"
                            >
                              {exp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submódulo e Módulo */}
              {lesson.submodule && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <BookOpen className="h-5 w-5" />
                    Estrutura do Curso
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Submódulo</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{lesson.submodule.title}</p>
                    </div>
                    {lesson.submodule.module && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Módulo</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{lesson.submodule.module.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Slug: {lesson.submodule.module.slug}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Datas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Datas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Criado em</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(lesson.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Atualizado em</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(lesson.updatedAt)}</p>
                  </div>
                  {lesson.completedAt && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Concluída em</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(lesson.completedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-[#25252a]">
                <Button onClick={onClose}>Fechar</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
