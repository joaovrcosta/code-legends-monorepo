"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Key } from "@phosphor-icons/react/dist/ssr";
import { Mail, Lock } from "lucide-react";
import { getUserFromAPI } from "@/actions/user/get-user-from-api";
import { unlinkGoogle } from "@/actions/user/unlink-google";
import { ChangeEmailModal } from "@/components/account/change-email-modal";

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

  useEffect(() => {
    async function fetchUserData() {
      try {
        const user = await getUserFromAPI();
        if (user) {
          const userDataToSet = {
            email: user.email,
            googleId: user.googleId ?? null,
            hasPassword: user.hasPassword ?? false,
          };
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
    } catch {
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
    <div className="w-full mt-8">
      {/* Estilo do Card original: bg-surface e borda escura */}
      <Card className="bg-surface border-[#25252a] lg:p-8 p-4 text-zinc-100">

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

      <ChangeEmailModal
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
        currentEmail={userData.email}
      />
    </div>
  );
}