"use client";

import { useEffect, useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/ui/page-header";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { listUsers, deleteUser, getUserById, type UserFull } from "@/actions/user";
import { getAuthTokenFromClient } from "@/lib/auth";
import { Users as UsersIcon, Trash2, Eye, X, Search, FilterX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = useState<UserFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserFull | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [filterSearch, setFilterSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterPlan, setFilterPlan] = useState<string>("");
  const [filterOnboarding, setFilterOnboarding] = useState<string>("");

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
        toast.error("Token de autenticação não encontrado");
        return;
      }
      await deleteUser(id, token);
      loadUsers();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário");
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      setLoadingDetails(true);
      const token = getAuthTokenFromClient();
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }
      const user = await getUserById(id, token);
      if (user) {
        setSelectedUser(user);
        setShowDetailsModal(true);
      } else {
        toast.error("Usuário não encontrado");
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do usuário:", error);
      toast.error("Erro ao carregar detalhes do usuário");
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
        return "bg-blue-900/20 bg-ch-accent/20 text-blue-700 dark:text-blue-300";
      case "STUDENT":
        return "bg-emerald-900/20 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300";
      default:
        return "bg-ch-surface-raised/50 dark:bg-ch-surface-raised/50 text-ch-muted";
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
        return "bg-ch-surface-raised bg-ch-muted";
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

  const getPlanBadgeColor = (plan: string | undefined) => {
    switch (plan) {
      case "PRO":
        return "bg-purple-900/20 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300";
      case "PREMIUM":
        return "bg-amber-900/20 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300";
      default:
        return "bg-lime-900/20 dark:bg-lime-500/20 text-lime-700 dark:text-lime-300";
    }
  };

  const getPlanLabel = (plan: string | undefined) =>
    plan === "PREMIUM" ? "Premium" : plan === "PRO" ? "Pro" : "Free";

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = filterSearch.trim().toLowerCase();
      if (searchLower) {
        const matchName = user.name.toLowerCase().includes(searchLower);
        const matchEmail = user.email.toLowerCase().includes(searchLower);
        if (!matchName && !matchEmail) return false;
      }
      if (filterRole && user.role !== filterRole) return false;
      const userPlan = user.plan ?? "FREE";
      if (filterPlan && userPlan !== filterPlan) return false;
      if (filterOnboarding === "complete" && !user.onboardingCompleted) return false;
      if (filterOnboarding === "pending" && user.onboardingCompleted) return false;
      return true;
    });
  }, [users, filterSearch, filterRole, filterPlan, filterOnboarding]);

  const hasActiveFilters =
    filterSearch.trim() !== "" || filterRole !== "" || filterPlan !== "" || filterOnboarding !== "";

  const clearFilters = () => {
    setFilterSearch("");
    setFilterRole("");
    setFilterPlan("");
    setFilterOnboarding("");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title={
            <span className="inline-flex items-center gap-3">
              <UsersIcon className="h-8 w-8" />
              Usuários
            </span>
          }
          description="Gerencie todos os usuários da plataforma"
        />

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!loading && (
              <div className="flex flex-wrap items-end gap-4 pb-4 border-b border-ch-border">
                <div className="flex-1 min-w-[200px] max-w-xs">
                  <Label htmlFor="filter-search" className="text-ch-muted text-xs">
                    Buscar (nome ou e-mail)
                  </Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ch-muted" />
                    <Input
                      id="filter-search"
                      type="text"
                      placeholder="Digite para filtrar..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="w-[140px]">
                  <Label htmlFor="filter-role" className="text-ch-muted text-xs">
                    Função
                  </Label>
                  <Select
                    id="filter-role"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="mt-1"
                  >
                    <option value="">Todas</option>
                    <option value="ADMIN">Admin</option>
                    <option value="INSTRUCTOR">Instrutor</option>
                    <option value="STUDENT">Estudante</option>
                  </Select>
                </div>
                <div className="w-[120px]">
                  <Label htmlFor="filter-plan" className="text-ch-muted text-xs">
                    Plan
                  </Label>
                  <Select
                    id="filter-plan"
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    className="mt-1"
                  >
                    <option value="">Todos</option>
                    <option value="FREE">Free</option>
                    <option value="PRO">Pro</option>
                    <option value="PREMIUM">Premium</option>
                  </Select>
                </div>
                <div className="w-[160px]">
                  <Label htmlFor="filter-onboarding" className="text-ch-muted text-xs">
                    Onboarding
                  </Label>
                  <Select
                    id="filter-onboarding"
                    value={filterOnboarding}
                    onChange={(e) => setFilterOnboarding(e.target.value)}
                    className="mt-1"
                  >
                    <option value="">Todos</option>
                    <option value="complete">Completo</option>
                    <option value="pending">Pendente</option>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1">
                    <FilterX className="h-4 w-4" />
                    Limpar filtros
                  </Button>
                )}
              </div>
            )}
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <>
                {hasActiveFilters && (
                  <p className="text-sm text-ch-muted">
                    {filteredUsers.length === users.length
                      ? `${users.length} usuário(s)`
                      : `${filteredUsers.length} de ${users.length} usuário(s)`}
                  </p>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Avatar</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead>XP Total</TableHead>
                      <TableHead>Onboarding</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center py-8 text-ch-muted"
                        >
                          {users.length === 0
                            ? "Nenhum usuário encontrado"
                            : "Nenhum usuário corresponde aos filtros"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
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
                              <div className="w-10 h-10 rounded-full bg-ch-surface-raised flex items-center justify-center text-ch-muted font-medium">
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
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(
                                user.plan
                              )}`}
                            >
                              {getPlanLabel(user.plan)}
                            </span>
                          </TableCell>
                          <TableCell>Nível {user.level}</TableCell>
                          <TableCell>{user.totalXp.toLocaleString("pt-BR")}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.onboardingCompleted
                                ? "bg-emerald-900/20 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : "bg-amber-900/20 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${user.onboardingCompleted
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
                                  <Eye className="h-4 w-4 text-ch-accent" />
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
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes do Usuário */}
      {showDetailsModal && selectedUser && (
        <div className="cb-modal-overlay p-4">
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
                    <p className="text-sm text-ch-muted">Nome</p>
                    <p className="font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-ch-muted">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-ch-muted">Função</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs inline-block ${getRoleBadgeColor(
                        selectedUser.role
                      )}`}
                    >
                      {getRoleLabel(selectedUser.role)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-ch-muted">Slug</p>
                    <p className="font-medium">{selectedUser.slug || "Não informado"}</p>
                  </div>
                  {selectedUser.bio && (
                    <div className="col-span-2">
                      <p className="text-sm text-ch-muted">Bio</p>
                      <p className="font-medium">{selectedUser.bio}</p>
                    </div>
                  )}
                  {selectedUser.expertise && selectedUser.expertise.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-ch-muted">Expertise</p>
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
                    <p className="text-sm text-ch-muted">Nível</p>
                    <p className="font-medium text-xl">Nível {selectedUser.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-ch-muted">XP Total</p>
                    <p className="font-medium text-xl">
                      {selectedUser.totalXp.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-ch-muted">XP para Próximo Nível</p>
                    <p className="font-medium">{selectedUser.xpToNextLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-ch-muted">Onboarding</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs inline-block ${selectedUser.onboardingCompleted
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {selectedUser.onboardingCompleted ? "Completo" : "Pendente"}
                    </span>
                  </div>
                  {selectedUser.onboardingGoal && (
                    <div>
                      <p className="text-sm text-ch-muted">Objetivo do Onboarding</p>
                      <p className="font-medium">{selectedUser.onboardingGoal}</p>
                    </div>
                  )}
                  {selectedUser.onboardingCareer && (
                    <div>
                      <p className="text-sm text-ch-muted">Carreira do Onboarding</p>
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
                      <p className="text-sm text-ch-muted">Nome Completo</p>
                      <p className="font-medium">{selectedUser.fullname}</p>
                    </div>
                  )}
                  {selectedUser.birth_date && (
                    <div>
                      <p className="text-sm text-ch-muted">Data de Nascimento</p>
                      <p className="font-medium">{formatDate(selectedUser.birth_date)}</p>
                    </div>
                  )}
                  {selectedUser.born_in && (
                    <div>
                      <p className="text-sm text-ch-muted">Naturalidade</p>
                      <p className="font-medium">{selectedUser.born_in}</p>
                    </div>
                  )}
                  {selectedUser.gender && (
                    <div>
                      <p className="text-sm text-ch-muted">Gênero</p>
                      <p className="font-medium">{selectedUser.gender}</p>
                    </div>
                  )}
                  {selectedUser.marital_status && (
                    <div>
                      <p className="text-sm text-ch-muted">Estado Civil</p>
                      <p className="font-medium">{selectedUser.marital_status}</p>
                    </div>
                  )}
                  {selectedUser.occupation && (
                    <div>
                      <p className="text-sm text-ch-muted">Ocupação</p>
                      <p className="font-medium">{selectedUser.occupation}</p>
                    </div>
                  )}
                  {selectedUser.phone && (
                    <div>
                      <p className="text-sm text-ch-muted">Telefone</p>
                      <p className="font-medium">{selectedUser.phone}</p>
                    </div>
                  )}
                  {selectedUser.foreign_phone && (
                    <div>
                      <p className="text-sm text-ch-muted">Telefone Estrangeiro</p>
                      <p className="font-medium">{selectedUser.foreign_phone}</p>
                    </div>
                  )}
                  {selectedUser.document && (
                    <div>
                      <p className="text-sm text-ch-muted">Documento</p>
                      <p className="font-medium">{selectedUser.document}</p>
                    </div>
                  )}
                  {selectedUser.rg && (
                    <div>
                      <p className="text-sm text-ch-muted">RG</p>
                      <p className="font-medium">{selectedUser.rg}</p>
                    </div>
                  )}
                  {selectedUser.address && (
                    <div className="col-span-2">
                      <p className="text-sm text-ch-muted">Endereço</p>
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
                    <p className="text-sm text-ch-muted">ID</p>
                    <p className="font-mono text-xs">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-ch-muted">Criado em</p>
                    <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-ch-muted">Atualizado em</p>
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

