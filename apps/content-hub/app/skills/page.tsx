"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { listSkills, type Skill } from "@/actions/skill/list-skills";
import { createSkill } from "@/actions/skill/create-skill";
import { updateSkill } from "@/actions/skill/update-skill";
import { getAuthTokenFromClient } from "@/lib/auth";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  useEffect(() => {
    loadSkills();
  }, []);

  useEffect(() => {
    if (name && !slugManuallyEdited) {
      setSlug(generateSlug(name));
    }
  }, [name, slugManuallyEdited]);

  useEffect(() => {
    if (editingSkill) {
      setEditName(editingSkill.name);
      setEditSlug(editingSkill.slug);
      setEditDescription(editingSkill.description ?? "");
      setEditImageUrl(editingSkill.imageUrl ?? "");
    }
  }, [editingSkill]);

  const loadSkills = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const { skills } = await listSkills(searchTerm);
      setSkills(skills);
    } catch (error) {
      console.error("Erro ao carregar skills:", error);
      toast.error("Erro ao carregar skills");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadSkills(search.trim() || undefined);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nome da skill é obrigatório");
      return;
    }

    const token = getAuthTokenFromClient();
    if (!token) {
      toast.error("Token de autenticação não encontrado");
      return;
    }

    try {
      setLoading(true);
      await createSkill(
        {
          name: name.trim(),
          slug: slug.trim() || generateSlug(name.trim()),
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim() || null,
        },
        token
      );
      toast.success("Skill criada com sucesso");
      setName("");
      setSlug("");
      setDescription("");
      setImageUrl("");
      setSlugManuallyEdited(false);
      await loadSkills();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar skill");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;

    const token = getAuthTokenFromClient();
    if (!token) {
      toast.error("Token de autenticação não encontrado");
      return;
    }

    try {
      setLoading(true);
      await updateSkill(
        editingSkill.id,
        {
          name: editName.trim(),
          slug: editSlug.trim(),
          description: editDescription.trim() || null,
          imageUrl: editImageUrl.trim() || null,
        },
        token
      );
      toast.success("Skill atualizada");
      setEditingSkill(null);
      await loadSkills(search.trim() || undefined);
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar skill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova skill</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">
                  URL da imagem (opcional)
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://…"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ícone ou logo público da skill (mesmo conceito que avatar de
                  usuário).
                </p>
              </div>
              <Button type="submit" disabled={loading}>
                Criar skill
              </Button>
            </form>
          </CardContent>
        </Card>

        {editingSkill ? (
          <Card>
            <CardHeader>
              <CardTitle>Editar skill: {editingSkill.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editName">Nome</Label>
                    <Input
                      id="editName"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editSlug">Slug</Label>
                    <Input
                      id="editSlug"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="editDescription">Descrição</Label>
                  <Input
                    id="editDescription"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="editImageUrl">
                    URL da imagem (opcional)
                  </Label>
                  <Input
                    id="editImageUrl"
                    type="url"
                    placeholder="https://…"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={() => setEditingSkill(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Skills cadastradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Buscar skill por nome ou slug"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" variant="outline">
                Buscar
              </Button>
            </form>

            {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}

            {!loading && skills.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma skill cadastrada ainda.
              </p>
            )}

            {!loading && skills.length > 0 && (
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 size-9 rounded-md border border-border overflow-hidden bg-muted flex items-center justify-center">
                        {skill.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={skill.imageUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">{skill.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          slug: {skill.slug}
                          {skill.description
                            ? ` • ${skill.description}`
                            : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {typeof skill.coursesCount === "number" && (
                        <div className="text-xs text-muted-foreground">
                          {skill.coursesCount} curso(s)
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSkill(skill)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
