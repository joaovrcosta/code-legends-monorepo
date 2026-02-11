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
import { listModules, deleteModule, type Module } from "@/actions/module";
import { listCourses } from "@/actions/course";
import { getAuthTokenFromClient } from "@/lib/auth";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadModules();
    } else {
      setModules([]);
    }
  }, [selectedCourse]);

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
      setLoading(true);
      const { modules: data } = await listModules(selectedCourse);
      setModules(data);
    } catch (error) {
      console.error("Erro ao carregar módulos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este módulo?")) return;
    try {
      const token = getAuthTokenFromClient();
      if (!token) {
        alert("Token de autenticação não encontrado");
        return;
      }
      await deleteModule(id, token);
      loadModules();
    } catch (error) {
      console.error("Erro ao excluir módulo:", error);
      alert("Erro ao excluir módulo");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Módulos</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie os módulos dos cursos</p>
          </div>
          {selectedCourse && (
            <Link href={`/modules/new?courseId=${selectedCourse}`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Módulo
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selecione um Curso</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {selectedCourse && (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Módulos</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                          Nenhum módulo encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      modules.map((module) => (
                        <TableRow key={module.id}>
                          <TableCell className="font-medium">{module.title}</TableCell>
                          <TableCell>{module.slug}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link href={`/modules/${module.id}/edit`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(module.id)}
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

