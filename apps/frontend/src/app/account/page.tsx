import { MyCourses } from "@/components/account/my-courses";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { Crown, KeyRound } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/actions/user/get-current-user";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minha Conta - Code Legends",
  description: "Gerencie sua conta, cursos, certificados e configurações pessoais.",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }
  return (
    <div className="space-y-4">
      <div className="lg:flex hidden items-center space-x-2 px-4 py-8 mt-8">
        <Avatar className="h-[52px] w-[52px]">
          <AvatarImage src={user.avatar || ""} />
          <AvatarFallback>
            {user.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p>{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            Membro desde{" "}
            {new Date(user.createdAt).toLocaleDateString("pt-BR", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>
      <MyCourses />

      <Card className="bg-[#121214] border-[#25252a] lg:p-10 p-4">
        <CardHeader className="px-4">
          <div className="flex items-center space-x-2">
            <span className="text-blue-gradient-500">
              <Crown className="w-6 h-6 text-[#00c8ff]" />
            </span>
            <h1 className="text-lg font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
              Assinatura
            </h1>
            <Link href="/account/purchases">
              <span className="text-sm text-muted-foreground">Gerenciar</span>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your certficates and preferences.
          </p>
        </CardHeader>
      </Card>

      <Card className="bg-[#121214] border-[#25252a] lg:p-10 p-4">
        <CardHeader className="px-4">
          <div className="flex items-center space-x-2">
            <span className="text-blue-gradient-500">
              <KeyRound className="w-6 h-6 text-[#00c8ff]" />
            </span>
            <h1 className="text-lg font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
              Meus dados
            </h1>
            <Link href="/account/access">
              <span className="text-sm text-muted-foreground">Alterar</span>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your certficates and preferences.
          </p>
        </CardHeader>
      </Card>
    </div>
  );
}
