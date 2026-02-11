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
import { listUsers, deleteUser, getUserById, type UserFull } from "@/actions/user";
import { getAuthTokenFromClient } from "@/lib/auth";
import { Users as UsersIcon, Trash2, Eye, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState<UserFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserFull | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthTokenFromClient();
      const { users: data } = await listUsers(token || undefined);
      setUsers(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const token = getAuthTokenFromClient();
      if (!token) {
        alert("Token de autenticação não encontrado");
        return;
      }
      await deleteUser(id, token);
      loadUsers();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      alert("Erro ao excluir usuário");
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      setLoadingDetails(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        alert("Token de autenticação não encontrado");
        return;
      }
      const user = await getUserById(id, token);
      if (user) {
        setSelectedUser(user);
        setShowDetailsModal(true);
      } else {
        alert("Usuário não encontrado");
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do usuário:", error);
      alert("Erro ao carregar detalhes do usuário");
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-8 w-8 text-gray-900 dark:text-gray-100" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Usuários</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie todos os usuários da plataforma
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Avatar</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>XP Total</TableHead>
                    <TableHead>Onboarding</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-8 text-gray-500"
                      >
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${getRoleDotColor(
                                user.role
                              )}`}
                            />
                            {getRoleLabel(user.role)}
                          </span>
                        </TableCell>
                        <TableCell>Nível {user.level}</TableCell>
                        <TableCell>{user.totalXp.toLocaleString("pt-BR")}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              user.onboardingCompleted
                                ? "bg-emerald-900/20 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : "bg-amber-900/20 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.onboardingCompleted
                                  ? "bg-emerald-700 dark:bg-emerald-400"
                                  : "bg-amber-700 dark:bg-amber-400"
                              }`}
                            />
                            {user.onboardingCompleted
                              ? "Completo"
                              : "Pendente"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/users/${user.id}/overview`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Ver overview"
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(user.id)}
                              title="Excluir"
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
      </div>

      {/* Modal de Detalhes do Usuário */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Detalhes do Usuário</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedUser(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Função</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs inline-block ${getRoleBadgeColor(
                        selectedUser.role
                      )}`}
                    >
                      {getRoleLabel(selectedUser.role)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Slug</p>
                    <p className="font-medium">{selectedUser.slug || "Não informado"}</p>
                  </div>
                  {selectedUser.bio && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Bio</p>
                      <p className="font-medium">{selectedUser.bio}</p>
                    </div>
                  )}
                  {selectedUser.expertise && selectedUser.expertise.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Expertise</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedUser.expertise.map((exp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações de Progresso */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Progresso</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nível</p>
                    <p className="font-medium text-xl">Nível {selectedUser.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">XP Total</p>
                    <p className="font-medium text-xl">
                      {selectedUser.totalXp.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">XP para Próximo Nível</p>
                    <p className="font-medium">{selectedUser.xpToNextLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Onboarding</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs inline-block ${
                        selectedUser.onboardingCompleted
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedUser.onboardingCompleted ? "Completo" : "Pendente"}
                    </span>
                  </div>
                  {selectedUser.onboardingGoal && (
                    <div>
                      <p className="text-sm text-gray-500">Objetivo do Onboarding</p>
                      <p className="font-medium">{selectedUser.onboardingGoal}</p>
                    </div>
                  )}
                  {selectedUser.onboardingCareer && (
                    <div>
                      <p className="text-sm text-gray-500">Carreira do Onboarding</p>
                      <p className="font-medium">{selectedUser.onboardingCareer}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações Pessoais */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedUser.fullname && (
                    <div>
                      <p className="text-sm text-gray-500">Nome Completo</p>
                      <p className="font-medium">{selectedUser.fullname}</p>
                    </div>
                  )}
                  {selectedUser.birth_date && (
                    <div>
                      <p className="text-sm text-gray-500">Data de Nascimento</p>
                      <p className="font-medium">{formatDate(selectedUser.birth_date)}</p>
                    </div>
                  )}
                  {selectedUser.born_in && (
                    <div>
                      <p className="text-sm text-gray-500">Naturalidade</p>
                      <p className="font-medium">{selectedUser.born_in}</p>
                    </div>
                  )}
                  {selectedUser.gender && (
                    <div>
                      <p className="text-sm text-gray-500">Gênero</p>
                      <p className="font-medium">{selectedUser.gender}</p>
                    </div>
                  )}
                  {selectedUser.marital_status && (
                    <div>
                      <p className="text-sm text-gray-500">Estado Civil</p>
                      <p className="font-medium">{selectedUser.marital_status}</p>
                    </div>
                  )}
                  {selectedUser.occupation && (
                    <div>
                      <p className="text-sm text-gray-500">Ocupação</p>
                      <p className="font-medium">{selectedUser.occupation}</p>
                    </div>
                  )}
                  {selectedUser.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium">{selectedUser.phone}</p>
                    </div>
                  )}
                  {selectedUser.foreign_phone && (
                    <div>
                      <p className="text-sm text-gray-500">Telefone Estrangeiro</p>
                      <p className="font-medium">{selectedUser.foreign_phone}</p>
                    </div>
                  )}
                  {selectedUser.document && (
                    <div>
                      <p className="text-sm text-gray-500">Documento</p>
                      <p className="font-medium">{selectedUser.document}</p>
                    </div>
                  )}
                  {selectedUser.rg && (
                    <div>
                      <p className="text-sm text-gray-500">RG</p>
                      <p className="font-medium">{selectedUser.rg}</p>
                    </div>
                  )}
                  {selectedUser.address && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Endereço</p>
                      <p className="font-medium">{selectedUser.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações do Sistema */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Informações do Sistema</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">ID</p>
                    <p className="font-mono text-xs">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Criado em</p>
                    <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Atualizado em</p>
                    <p className="font-medium">{formatDate(selectedUser.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}

