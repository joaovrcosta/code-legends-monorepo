"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  BookOpen,
  Users,
  GraduationCap,
  LogOut,
  Tag,
  Brain,
  Briefcase,
  MessageSquare,
  CreditCard,
  Crown,
  Award,
  Settings,
  Megaphone,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: GraduationCap },
  { name: "Cursos", href: "/courses", icon: BookOpen },
  { name: "Carreiras", href: "/careers", icon: Briefcase },
  { name: "Usuários", href: "/users", icon: Users },
  { name: "Pagamentos", href: "/payments", icon: CreditCard },
  { name: "Planos", href: "/plans", icon: Crown },
  { name: "Categorias", href: "/categories", icon: Tag },
  { name: "Skills", href: "/skills", icon: Brain },
  { name: "Certificados", href: "/certificates", icon: Award },
  { name: "Skills / XP", href: "/skills", icon: Brain },
  { name: "Solicitações", href: "/requests", icon: MessageSquare },
  { name: "Broadcaster", href: "/broadcast", icon: Megaphone },
  { name: "Configurações Globais", href: "/settings/gamification", icon: Settings },
  { name: "Provedores de vídeo", href: "/settings/video-providers", icon: Settings },
];

export function Sidebar({
  isMobileOpen = false,
  onMobileClose,
}: {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  const handleNavClick = () => {
    onMobileClose?.();
  };

  return (
    <>
      {/* Overlay mobile */}
      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-out dark:border-[#25252a] dark:bg-[#101013]",
          "lg:static lg:translate-x-0 lg:z-auto",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-[#25252a] px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Code Legends</h1>
        <ThemeToggle />
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 dark:border-[#25252a] p-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </Button>
      </div>
      </aside>
    </>
  );
}

