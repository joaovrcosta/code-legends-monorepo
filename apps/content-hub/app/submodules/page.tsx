"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { listGroups, deleteGroup, type Group } from "@/actions/group";
import { listModules } from "@/actions/module";
import { listCourses } from "@/actions/course";
import { getAuthTokenFromClient } from "@/lib/auth";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export default function SubmodulesPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [modules, setModules] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadModules();
    } else {
      setModules([]);
      setSelectedModule("");
      setGroups([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedModule) {
      loadGroups();
    } else {
      setGroups([]);
    }
  }, [selectedModule]);

  const loadCourses = async () => {
    try {
      const { courses } = await listCourses();
      setCourses(courses.map((c) => ({ id: c.id, title: c.title })));
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
    }
  };

  const loadModules = async () => {
    try {
      const { modules } = await listModules(selectedCourse);
      setModules(modules.map((m) => ({ id: m.id, title: m.title })));
    } catch (error) {
      console.error("Erro ao carregar módulos:", error);
    }
  };

  const loadGroups = async () => {
    try {
      setLoading(true);
      const { groups: data } = await listGroups(selectedModule);
      setGroups(data);
    } catch (error) {
      console.error("Erro ao carregar submódulos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este submódulo?")) return;
    try {
      const token = getAuthTokenFromClient();
      if (!token) {
        alert("Token de autenticação não encontrado");
        return;
      }
      await deleteGroup(id, token);
      loadGroups();
    } catch (error) {
      console.error("Erro ao excluir submódulo:", error);
      alert("Erro ao excluir submódulo");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Submódulos</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie os submódulos (grupos) dos módulos</p>
          </div>
          {selectedModule && (
            <Link href={`/submodules/new?moduleId=${selectedModule}`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Submódulo
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selecione Curso e Módulo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Curso</label>
                <Select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Selecione um curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Módulo</label>
                <Select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  disabled={!selectedCourse}
                >
                  <option value="">Selecione um módulo</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedModule && (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Submódulos</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                          Nenhum submódulo encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      groups.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">{group.title}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link href={`/submodules/${group.id}/edit`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(group.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

