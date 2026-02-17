"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Key } from "@phosphor-icons/react/dist/ssr";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { getUserFromAPI } from "@/actions/user/get-user-from-api";
import { unlinkGoogle } from "@/actions/user/unlink-google";
import { createRequest } from "@/actions/request/create-request";
import { verifyPassword } from "@/actions/auth/verify-password";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface UserData {
  email: string;
  googleId: string | null;
  hasPassword: boolean;
}

export default function AccountAccessPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const user = await getUserFromAPI();
        console.log("📦 Dados do usuário recebidos:", user);
        if (user) {
          const userDataToSet = {
            email: user.email,
            googleId: (user as any).googleId || null,
            hasPassword: (user as any).hasPassword ?? false,
          };
          console.log("📦 Dados processados:", userDataToSet);
          setUserData(userDataToSet);
        } else {
          console.error("❌ Usuário não encontrado");
        }
      } catch (error) {
        console.error("❌ Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  const handleUnlinkGoogle = async () => {
    if (!confirm("Tem certeza que deseja desvincular sua conta Google?")) {
      return;
    }

    setUnlinking(true);
    try {
      const result = await unlinkGoogle();
      if (result.success) {
        alert("Conta Google desvinculada com sucesso!");
        // Atualizar dados do usuário
        const user = await getUserFromAPI();
        if (user) {
          setUserData({
            email: user.email,
            googleId: null,
            hasPassword: user.hasPassword || false,
          });
        }
      } else {
        alert(result.message || "Erro ao desvincular conta Google");
      }
    } catch (error) {
      alert("Erro ao desvincular conta Google");
    } finally {
      setUnlinking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-8 w-full">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center mt-8 w-full">
        <div className="text-muted-foreground">Erro ao carregar dados</div>
      </div>
    );
  }
  return (
    <div className="flex justify-center mt-8 w-full">
      {/* Estilo do Card original: bg-[#121214] e borda escura */}
      <Card className="bg-[#121214] border-[#25252a] lg:p-8 p-4 w-full text-zinc-100">

        {/* Cabeçalho com o estilo "Gradient" e Coroa */}
        <CardHeader className="px-0 pt-0 pb-8">
          <div className="flex items-center justify-between border-b border-[#25252a] pb-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {/* Ícone Cyan */}
                <span className="text-[#00c8ff]">
                  <Key className="w-6 h-6" />
                </span>
                {/* Texto com Gradiente (simulado com classes Tailwind padrão para garantir funcionamento) */}
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#00c8ff] to-[#00ff88] bg-clip-text text-transparent">
                  Dados de acesso
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Gerencie seus dados de acesso e contas vinculadas.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 space-y-6">
          {/* BLOCO 1: E-mail e Senha (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Campo E-mail - Estilo Pill (rounded-full) */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground ml-1">Email</label>
              <div className="flex items-center justify-between h-[52px] bg-transparent rounded-full px-5 border border-[#25252a] hover:border-[#00c8ff]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#00c8ff]" />
                  <span className="text-sm text-zinc-300">{userData.email}</span>
                </div>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="text-sm font-medium text-muted-foreground hover:text-[#00c8ff] transition-colors"
                >
                  Alterar
                </button>
              </div>
            </div>

            {/* Campo Senha - Estilo Pill (rounded-full) */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground ml-1">Senha</label>
              <div className="flex items-center justify-between h-[52px] bg-transparent rounded-full px-5 border border-[#25252a] hover:border-[#00c8ff]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-[#00c8ff]" />
                  <span className="text-sm text-zinc-300 tracking-widest">
                    {userData.hasPassword ? "********" : "Não definida"}
                  </span>
                </div>
                <button className="text-sm font-medium text-muted-foreground hover:text-[#00c8ff] transition-colors">
                  {userData.hasPassword ? "Alterar" : "Definir"}
                </button>
              </div>
            </div>
          </div>

          {/* BLOCO 2: Contas Vinculadas - Estilo Pill Maior */}
          {userData.googleId && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground ml-1">Conta vinculada</label>
                <div className="flex items-center justify-between h-[64px] bg-transparent rounded-full px-5 border border-[#25252a] hover:border-[#00c8ff]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#202024] rounded-full">
                      {/* SVG Google */}
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-zinc-300">{userData.email}</span>
                  </div>
                  <button
                    onClick={handleUnlinkGoogle}
                    disabled={unlinking}
                    className="text-sm font-medium text-red-400 transition-colors h-auto p-0"
                  >
                    {unlinking ? "Desvinculando..." : "Desvincular"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Alterar Email */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="bg-[#121214] border-[#25252A] text-white max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-white">
                Alterar email
              </DialogTitle>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setError(null);
                }}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              Por motivos de segurança, nossa equipe validará a alteração.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Box de Erro */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <X className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-400 mb-1">Erro na validação</h4>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Email Atual */}
            <div className="flex items-center gap-3 p-3 bg-[#1A1A1E] rounded-lg border border-[#25252A]">
              <Mail className="w-5 h-5 text-[#00C8FF] flex-shrink-0" />
              <span className="text-sm text-zinc-300">{userData.email}</span>
            </div>

            {/* Novo Email */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Novo email</label>
              <Input
                type="email"
                placeholder="Para qual e-mail você gostaria de alterar?"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-transparent border-[#25252A] text-white placeholder:text-muted-foreground"
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha para confirmar"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-[#25252A] text-white placeholder:text-muted-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Motivo da Alteração */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Motivo da alteração</label>
              <div className="relative">
                <Textarea
                  placeholder="Descreva por que você precisa fazer essa alteração"
                  value={reason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    if (e.target.value.length <= 100) {
                      setReason(e.target.value);
                    }
                  }}
                  className="bg-transparent border-[#25252A] text-white placeholder:text-muted-foreground min-h-[100px] resize-none"
                  maxLength={100}
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  {reason.length}/100
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowEmailModal(false);
                setNewEmail("");
                setPassword("");
                setReason("");
                setError(null);
              }}
              className="bg-transparent border-[#25252A] text-muted-foreground hover:text-white rounded-[12px] h-[52px]"
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!newEmail || !password || !reason) {
                  setError("Por favor, preencha todos os campos");
                  return;
                }

                setError(null);
                setSubmitting(true);

                try {
                  // Primeiro, validar a senha (sem enviá-la na solicitação)
                  const passwordVerification = await verifyPassword(password);

                  if (!passwordVerification.success) {
                    setError(
                      passwordVerification.message ||
                      "Senha incorreta. Verifique e tente novamente."
                    );
                    setSubmitting(false);
                    return;
                  }

                  // Senha válida - criar solicitação SEM incluir a senha
                  const requestData = {
                    newEmail,
                    reason,
                    // NÃO incluímos a senha aqui por segurança
                  };

                  const result = await createRequest({
                    type: "EMAIL_CHANGE",
                    title: "Solicitação de alteração de email",
                    description: reason,
                    data: JSON.stringify(requestData),
                  });

                  if (result.success) {
                    alert("Solicitação de alteração enviada! Nossa equipe validará em breve.");
                    setShowEmailModal(false);
                    setNewEmail("");
                    setPassword("");
                    setReason("");
                    setError(null);
                  } else {
                    setError(result.message || "Erro ao enviar solicitação. Tente novamente.");
                  }
                } catch (error) {
                  console.error("Erro ao criar solicitação:", error);
                  setError("Erro ao enviar solicitação. Tente novamente.");
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting || !newEmail || !password || !reason}
              className="bg-[#00c8ff] text-white hover:opacity-90 rounded-[12px] h-[52px]"
            >
              {submitting ? "Enviando..." : "Solicitar alteração"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}