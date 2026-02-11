import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuth = (requireAuth: boolean = false) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;

  // Verificar se há erro de refresh token na sessão
  useEffect(() => {
    const sessionError = (session as { error?: string })?.error;
    if (sessionError === "RefreshAccessTokenError") {
      // Fazer logout quando houver erro de refresh token
      console.log("🔒 Erro de refresh token detectado, fazendo logout...");
      signOut({ redirect: true, callbackUrl: "/login" });
    }
  }, [session]);

  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router, requireAuth]);

  return {
    user: session?.user,
    isLoading,
    isAuthenticated,
  };
};
