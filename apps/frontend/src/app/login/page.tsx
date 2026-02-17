"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import codeLegendsLogo from "../../../public/code-legends-logo.svg";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Crown } from "lucide-react";
import DividerWithText from "@/components/divider-with-text";
import { useState, useEffect } from "react";
import Link from "next/link";
import { loginUser } from "@/actions/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  // Verifica se há erro na query string (vindo do NextAuth)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      // Mapeia códigos de erro do NextAuth para mensagens amigáveis
      const errorMessages: Record<string, string> = {
        "OAuthAccountNotLinked": "Conta não encontrada. Apenas usuários já cadastrados podem associar sua conta ao Google.",
        "Configuration": "Erro de configuração. Entre em contato com o suporte.",
        "AccessDenied": "Acesso negado. Verifique suas permissões.",
        "Verification": "Erro na verificação. Tente novamente.",
      };
      setError(errorMessages[errorParam] || "Erro ao fazer login. Tente novamente.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch("email");
  const showPassword = emailValue && emailValue.trim().length > 0;

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await loginUser(formData);

      if (result?.success) {
        // Redirecionar para / e deixar o middleware fazer o redirect
        // para /onboarding se o usuário não completou o onboarding
        // Usar window.location.href para forçar reload completo e garantir
        // que o middleware seja executado com a sessão atualizada
        window.location.href = "/";
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao fazer login");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0D0D12] flex items-center justify-center">
      <div className="absolute w-[400px] h-[400px] top-0 left-0 rounded-full bg-[#00b3ffa9] opacity-40 blur-[200px] pointer-events-none" />

      <div className="absolute w-[300px] h-[300px] top-[20%] left-[30%] rounded-full bg-[#00b3ff5b] opacity-30 blur-[200px] pointer-events-none" />

      <div className="absolute w-[500px] h-[500px] bottom-0 right-0 rounded-full bg-[#00b3ffb6] opacity-40 blur-[220px] pointer-events-none" />

      <div className="relative z-10 w-full px-4">
        <div className="flex flex-col items-center justify-center max-w-[514px] mx-auto">
          <div className="mb-8">
            <Image
              src={codeLegendsLogo}
              alt="Login"
              width={149}
              height={36}
              className="w-auto h-auto"
            />
          </div>

          <Card className="w-full border border-[#25252A] rounded-[20px]">
            <CardHeader className="flex flex-col items-center space-y-4 mb-6 mt-6">
              <h1 className="text-2xl text-white font-medium text-center">
                Bem vindo de volta!
              </h1>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-5 pb-6">
                  {error && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}
                  <div>
                    <Input
                      className={`h-[52px] rounded-full bg-[#121214] text-white border px-4 ${errors.email
                        ? "border-red-500"
                        : "border-[#25252A]"
                        }`}
                      placeholder="E-mail"
                      type="email"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 px-4">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  {showPassword && (
                    <div>
                      <Input
                        className={`h-[52px] rounded-full bg-[#121214] text-white border px-4 ${errors.password
                          ? "border-red-500"
                          : "border-[#25252A]"
                          }`}
                        placeholder="Senha"
                        type="password"
                        {...register("password")}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1 px-4">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  )}
                  <PrimaryButton
                    className="font-semibold h-[52px]"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Acessar conta"}
                  </PrimaryButton>
                </div>
              </form>

              <div className="mb-6">
                <DividerWithText text="OU FAÇA LOGIN USANDO" />
                <div className="flex gap-3 justify-center">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setError("");
                        await signIn("google", { callbackUrl: "/" });
                      } catch (err) {
                        const errorMessage = err instanceof Error 
                          ? err.message 
                          : "Erro ao fazer login com Google";
                        setError(errorMessage);
                      }
                    }}
                    className="w-full h-[52px] gap-2 text-white bg-[#1a1a1e] border border-[#25252a] rounded-[32px] flex items-center justify-center hover:bg-[#25252a] transition-colors"
                    aria-label="Login com Google"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="font-medium">Google</span>
                  </button>

                  {/* <button
                    type="button"
                    className="w-full gap-2 text-white h-[42px] bg-[#1a1a1e] border border-[#25252a] rounded-[12px] flex items-center justify-center hover:bg-[#25252a] transition-colors"
                    aria-label="Login com Apple"
                  >
                    <GithubLogoIcon className="w-4 h-4 " weight="fill" />
                    <span className="font-medium">GitHub</span>
                  </button> */}
                </div>
              </div>


              <DividerWithText text="INSCREVA-SE AQUI" />

              <div className="flex flex-col items-center space-y-4 mt-4 mb-3">
                <Link href="/signup" className="w-full">
                  <PrimaryButton className="h-[52px]" variant="yellow">
                    Cadastre-se gratuitamente
                    <Crown className="text-[#FF9D00] ml-2" size={24} />
                  </PrimaryButton>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
