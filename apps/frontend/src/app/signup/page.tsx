"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import codeLegendsLogo from "../../../public/code-legends-logo.svg";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/ui/primary-button";
import DividerWithText from "@/components/divider-with-text";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const signupSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
    ),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      await registerUser(formData);
      router.push(
        "/login?message=Conta criada com sucesso! Faça login para continuar."
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta");
    } finally {
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
          <div className="mb-8 lg:mt-0 mt-16">
            <Image
              src={codeLegendsLogo}
              alt="Cadastro"
              width={149}
              height={36}
              className="w-auto h-auto"
            />
          </div>

          <Card className="w-full border border-[#25252A] rounded-[20px] mb-8">
            <CardHeader className="flex flex-col items-center space-y-4 mb-6 mt-6 px-4">
              <h1 className="text-2xl text-white font-medium text-center">
              Crie sua conta grátis e comece a programar hoje.
              </h1>
            </CardHeader>

            <CardContent>
              <div className="mb-6">
                <DividerWithText text="OU FAÇA CADASTRO USANDO" />
                <div className="flex gap-3 justify-center">
                  {/* Google */}
                  <button
                    type="button"
                    className="w-full h-[42px] bg-[#1a1a1e] border border-[#25252a] rounded-[12px] flex items-center justify-center hover:bg-[#25252a] transition-colors"
                    aria-label="Cadastro com Google"
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
                  </button>

                  {/* LinkedIn */}
                  <button
                    type="button"
                    className="w-full h-[42px] bg-[#1a1a1e] border border-[#25252a] rounded-[12px] flex items-center justify-center hover:bg-[#25252a] transition-colors"
                    aria-label="Cadastro com LinkedIn"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                        fill="#0077B5"
                      />
                    </svg>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    className="w-full h-[42px] bg-[#1a1a1e] border border-[#25252a] rounded-[12px] flex items-center justify-center hover:bg-[#25252a] transition-colors"
                    aria-label="Cadastro com Facebook"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        fill="#1877F2"
                      />
                    </svg>
                  </button>

                  {/* Apple */}
                  <button
                    type="button"
                    className="w-full h-[42px] bg-[#1a1a1e] border border-[#25252a] rounded-[12px] flex items-center justify-center hover:bg-[#25252a] transition-colors"
                    aria-label="Cadastro com Apple"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                        fill="white"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-5 pb-6">
                  {error && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}
                  <div>
                    <Input
                      className={`h-[52px] rounded-full bg-[#121214] text-white border px-4 ${
                        errors.email
                          ? "border-red-500"
                          : "border-[#25252A]"
                      }`}
                      placeholder="Seu e-mail"
                      type="email"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 px-4">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      className={`h-[52px] rounded-full bg-[#121214] text-white border px-4 ${
                        errors.password
                          ? "border-red-500"
                          : "border-[#25252A]"
                      }`}
                      placeholder="Deve ter no mínimo 8 caracteres"
                      type="password"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1 px-4">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <PrimaryButton
                    className="font-semibold h-[52px]"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Criando conta..."
                      : "Cadastre-se gratuitamente"}
                  </PrimaryButton>
                  <p className="text-[14px] text-muted-foreground text-center">
                    Ao se cadastrar, você aceita nossos{" "}
                    <span className="text-[#00C8FF]">termos de uso</span> e a
                    nossa{" "}
                    <span className="text-[#00C8FF]">
                      política de privacidade
                    </span>
                    .
                  </p>
                </div>
              </form>

              <DividerWithText text="JÁ TEM UMA CONTA?" />

              <div className="flex flex-col items-center space-y-4 mt-4 mb-3">
                <Link href="/login" className="w-full">
                  <PrimaryButton className="h-[52px]" variant="secondary">
                    Fazer login
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
