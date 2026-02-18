"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createLesson, type CreateLessonData } from "@/actions/lesson/create-lesson";
import { getAuthTokenFromClient } from "@/lib/auth";
import { X, FileJson } from "lucide-react";

interface ImportLessonsModalProps {
    groupId: number;
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
}

interface LessonImportData {
    title: string;
    description: string;
    type?: string;
    slug?: string;
    url?: string;
    video_url?: string;
    video_duration?: string;
    isFree?: boolean;
    locked?: boolean;
    order?: number;
}

export function ImportLessonsModal({
    groupId,
    isOpen,
    onClose,
    onImportComplete,
}: ImportLessonsModalProps) {
    const [jsonInput, setJsonInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<number>(0);

    const handleImport = async () => {
        if (!jsonInput.trim()) {
            setError("Por favor, insira o JSON com as aulas");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(0);

            const token = getAuthTokenFromClient();
            if (!token) {
                setError("Token de autenticação não encontrado");
                return;
            }

            // Parse do JSON
            let lessonsData: LessonImportData[];
            try {
                lessonsData = JSON.parse(jsonInput);
            } catch (parseError) {
                setError("JSON inválido. Verifique a sintaxe.");
                return;
            }

            if (!Array.isArray(lessonsData)) {
                setError("O JSON deve ser um array de aulas");
                return;
            }

            if (lessonsData.length === 0) {
                setError("O array está vazio");
                return;
            }

            const errors: string[] = [];
            let successCount = 0;

            // Criar cada aula
            for (let i = 0; i < lessonsData.length; i++) {
                const lesson = lessonsData[i];
                try {
                    // Validar campos obrigatórios
                    if (!lesson.title || !lesson.description) {
                        errors.push(`Aula ${i + 1}: Título e descrição são obrigatórios`);
                        continue;
                    }

                    // Gerar slug se não fornecido
                    const slug =
                        lesson.slug ||
                        lesson.title
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-+|-+$/g, "");

                    const lessonData: CreateLessonData = {
                        title: lesson.title,
                        description: lesson.description,
                        type: lesson.type || "video",
                        slug: slug,
                        url: lesson.url,
                        video_url: lesson.video_url,
                        video_duration: lesson.video_duration,
                        isFree: lesson.isFree ?? false,
                        locked: lesson.locked ?? false,
                        order: lesson.order ?? i + 1,
                    };

                    await createLesson(groupId, lessonData, token);
                    successCount++;
                } catch (error: any) {
                    errors.push(
                        `Aula ${i + 1} (${lesson.title || "sem título"}): ${error.message || "Erro desconhecido"}`
                    );
                }
            }

            setSuccess(successCount);
            if (errors.length > 0) {
                setError(
                    `${errors.length} erro(s) ao importar:\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n... e mais ${errors.length - 5} erro(s)` : ""
                    }`
                );
            } else {
                setError(null);
            }

            if (successCount > 0) {
                onImportComplete();
                setTimeout(() => {
                    handleClose();
                }, 2000);
            }
        } catch (error: any) {
            setError(error.message || "Erro ao importar aulas");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setJsonInput("");
        setError(null);
        setSuccess(0);
        onClose();
    };

    const exampleJson = `[
  {
    "title": "Introdução ao React",
    "description": "Aprenda os conceitos básicos do React",
    "type": "video",
    "slug": "introducao-ao-react",
    "video_url": "https://example.com/video1.mp4",
    "video_duration": "00:15:30",
    "isFree": false,
    "locked": false,
    "order": 1
  },
  {
    "title": "Componentes React",
    "description": "Entenda como criar componentes",
    "type": "video",
    "slug": "componentes-react",
    "video_url": "https://example.com/video2.mp4",
    "video_duration": "00:20:00",
    "isFree": false,
    "locked": false,
    "order": 2
  }
]`;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileJson className="h-5 w-5" />
                            Importar Aulas via JSON
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={handleClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="jsonInput">JSON das Aulas</Label>
                            <Textarea
                                id="jsonInput"
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder={exampleJson}
                                rows={15}
                                className="font-mono text-sm"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Cole aqui o JSON com um array de aulas. Campos obrigatórios: title, description.
                                Slug será gerado automaticamente se não fornecido.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm whitespace-pre-line">
                                {error}
                            </div>
                        )}

                        {success > 0 && !error && (
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded text-emerald-700 dark:text-emerald-300 text-sm">
                                {success} aula(s) importada(s) com sucesso!
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-4">
                            <Button variant="outline" onClick={handleClose} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button onClick={handleImport} disabled={loading}>
                                {loading ? "Importando..." : "Importar Aulas"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
