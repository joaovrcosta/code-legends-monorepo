"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Headset, LogOut, User, Zap } from "lucide-react";
import { logout } from "@/actions/auth";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export function UserDropdown() {
  const { data: session } = useSession();
  const user = session?.user;
  const [open, setOpen] = useState(false);

  // Obtém as iniciais do nome para o fallback
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Fecha o dropdown durante o resize para evitar reposicionamento constante do Popper
  useEffect(() => {
    let timeoutRef: NodeJS.Timeout | null = null;
    
    const handleResize = () => {
      // Fecha o dropdown imediatamente ao detectar resize
      if (open) {
        setOpen(false);
      }
    };

    // Debounce para evitar fechar múltiplas vezes durante resize contínuo
    const debouncedHandleResize = () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
      timeoutRef = setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedHandleResize);
    
    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, [open]);

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div className="hover:bg-[#25252A] p-1 rounded-full cursor-pointer">
            <Avatar className="h-[38px] w-[38px]">
              <AvatarImage src={user?.image || undefined} />
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          className="
                   w-screen 
                   max-w-none 
                   left-0 
                   right-0 
                   rounded-none 
                   border-none 
                   bg-[#1A1A1E] 
                   shadow-2xl 
                   z-50
                   mt-1
               
                   sm:w-auto 
                   sm:max-w-sm 
                   sm:rounded-[20px] 
                   sm:border 
                   sm:border-[#25252A] 
                   sm:left-auto 
                   sm:right-auto
                 "
        >
          <DropdownMenuLabel className="p-4">
            <div className="flex items-center justify-between">
              <span className="bg-blue-gradient-500 bg-clip-text text-transparent font-bold text-sm">
                Minha Conta
              </span>
              <div className="flex border border-[#25252A] py-2 px-4 rounded-[20px] items-center gap-3 text-[#8234E9] hover:bg-[#25252A] cursor-pointer">
                <Zap />
                <span className="bg-purple-gradient-500 bg-clip-text text-transparent font-bold text-sm">
                  Pro
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="border border-[#25252A]" />
          <DropdownMenuItem
            asChild
            className="px-6 py-4 lg:w-[352px] w-full text-white border-none rounded-[20px]"
          >
            <Link href="/account" className="flex items-center space-x-2">
              <User className="text-[#00C8FF]" />
              <span>Minha conta</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="px-6 py-4  lg:w-[352px] w-full text-white border-none rounded-[20px]"
          >
            <Link href="/account" className="flex items-center space-x-2">
              <Headset className="text-[#00C8FF]" />
              <span>Suporte</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="px-6 py-4  lg:w-[352px] w-full text-white border-none rounded-[20px] cursor-pointer"
            onClick={() => logout()}
          >
            <div className="flex items-center space-x-2">
              <LogOut className="text-[#fe6e78]" />
              <span className="text-[#fe6e78]">Sair da conta</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
