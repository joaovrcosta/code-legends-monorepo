"use client";

import { useState, useEffect } from "react";
import { LessonWithStructure } from "@/actions/course/get-course-with-structure";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateLesson } from "@/actions/lesson/update-lesson";
import { getAuthTokenFromClient } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import { X } from "lucide-react";
import { toast } from "sonner";

interface LessonEditModalProps {
    lesson: LessonWithStructure;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedLesson: LessonWithStructure) => void;
}

export function LessonEditModal({
    lesson,
    isOpen,
    onClose,
    onSave,
}: LessonEditModalProps) {
    const [loading, setLoading] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [formData, setFormData] = useState({
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        slug: lesson.slug,
        url: lesson.url || "",
        video_url: lesson.video_url || "",
        video_duration: lesson.video_duration || "",
        isFree: false,
        locked: lesson.locked,
        order: lesson.order,
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: lesson.title,
                description: lesson.description,
                type: lesson.type,
                slug: lesson.slug,
                url: lesson.url || "",
                video_url: lesson.video_url || "",
                video_duration: lesson.video_duration || "",
                isFree: lesson.isFree,
                locked: lesson.locked,
                order: lesson.order,
            });
            setSlugManuallyEdited(false);
        }
    }, [lesson, isOpen]);

    useEffect(() => {
        if (formData.title && !slugManuallyEdited) {
            setFormData((prev) => ({
                ...prev,
                slug: generateSlug(formData.title),
            }));
        }
    }, [formData.title, slugManuallyEdited]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = getAuthTokenFromClient();
            if (!token) {
                toast.error("Token de autenticação não encontrado");
                return;
            }

            await updateLesson(lesson.id.toString(), formData, token);
            onSave({
                ...lesson,
                ...formData,
                url: formData.url || null,
                video_url: formData.video_url || null,
                video_duration: formData.video_duration || null,
            });
            onClose();
        } catch (error) {
            console.error("Erro ao atualizar aula:", error);
            toast.error("Erro ao atualizar aula");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Editar Aula</CardTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => {
                                            setFormData({ ...formData, slug: e.target.value });
                                            setSlugManuallyEdited(true);
                                        }}
                                        required
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newSlug = generateSlug(formData.title);
                                            setFormData({ ...formData, slug: newSlug });
                                            setSlugManuallyEdited(true);
                                        }}
                                    >
                                        Gerar
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Tipo *</Label>
                                <Select
                                    id="type"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    required
                                >
                                    <option value="video">Vídeo</option>
                                    <option value="text">Texto</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="exercise">Exercício</option>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="order">Ordem</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) =>
                                        setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="url">URL</Label>
                                <Input
                                    id="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="video_url">URL do Vídeo</Label>
                                <Input
                                    id="video_url"
                                    value={formData.video_url}
                                    onChange={(e) =>
                                        setFormData({ ...formData, video_url: e.target.value })
                                    }
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="video_duration">Duração do Vídeo</Label>
                                <Input
                                    id="video_duration"
                                    value={formData.video_duration}
                                    onChange={(e) =>
                                        setFormData({ ...formData, video_duration: e.target.value })
                                    }
                                    placeholder="00:00:00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={4}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isFree}
                                    onChange={(e) =>
                                        setFormData({ ...formData, isFree: e.target.checked })
                                    }
                                    className="rounded"
                                />
                                <span>Aula Gratuita</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.locked}
                                    onChange={(e) =>
                                        setFormData({ ...formData, locked: e.target.checked })
                                    }
                                    className="rounded"
                                />
                                <span>Bloqueada</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button variant="outline" onClick={onClose} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
