"use client";

import Image from "next/image";
import codeLegendsLogo from "../../public/code-legends-logo.svg";
import codeLegendsLogoMobile from "../../public/logo-mobile.png";
import { ChevronRight, User, Menu, LogOut } from "lucide-react";
import circleIcon from "../../public/circle.svg";
import { PrimaryButton } from "./ui/primary-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogTitle } from "@radix-ui/react-dialog";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function ClientHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

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
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 lg:py-4 py-3 transition-colors duration-300 lg:px-0 px-4 ${
        scrolled
          ? "bg-[#121214]/80 border-b border-white/10 shadow-md"
          : "lg:bg-transparent bg-[#121214]"
      }`}
    >
      <div className="flex justify-between items-center md:px-16">
        <div className="hidden lg:block md:block">
          <Image src={codeLegendsLogo} alt="Code Legends" />
        </div>
        <div className="lg:hidden md:hidden sm:block">
          <Image src={codeLegendsLogoMobile} alt="Code Legends" height={32} />
        </div>

        {/* Menu Hamburger para telas menores */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger>
              <div className="flex items-center p-1 space-x-4  border  rounded-lg  border-[#c4c4cc]">
                <Menu size={28} color="#c4c4cc" />
              </div>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#121214] p-4">
              <DialogTitle className="text-[#c4c4cc]"> </DialogTitle>
              <div className="flex flex-col space-y-4">
                <a
                  href=""
                  className="text-[#c4c4cc] p-2 hover:bg-[#202024] rounded-lg"
                >
                  Conteúdos gratuitos
                </a>
                <a
                  href=""
                  className="text-[#c4c4cc] p-2 hover:bg-[#202024] rounded-lg"
                >
                  Cursos
                </a>
                <a
                  href=""
                  className="text-[#c4c4cc] p-2 hover:bg-[#202024] rounded-lg"
                >
                  Contato
                </a>
                <hr className="border-[#c4c4cc]" />
                {session ? (
                  <>
                    <Link
                      href="/account"
                      className="text-[#c4c4cc] p-2 hover:bg-[#202024] rounded-lg flex items-center space-x-2"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={session.user?.image || ""} />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{session.user?.name || "Usuário"}</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="text-[#c4c4cc] p-2 hover:bg-[#202024] rounded-lg flex items-center space-x-2"
                    >
                      <LogOut size={20} />
                      <span>SAIR</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-[#c4c4cc] p-2 hover:bg-[#202024] rounded-lg flex items-center space-x-2"
                    >
                      <User size={20} />
                      <span>LOGIN</span>
                    </Link>
                    <Link href="/signup">
                      <PrimaryButton>
                        CADASTRAR
                        <ChevronRight />
                      </PrimaryButton>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Menu para telas maiores */}
        <ul className="hidden space-x-12 items-center lg:flex xl:flex">
          <ul className="flex space-x-8 items-center">
            <li className="hidden xl:block">
              <a
                href=""
                className="relative p-3 flex space-x-2 rounded-xl px-8 hover:text-white group"
              >
                <span className="absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-[#00c8ff] via-[rgb(0 78 99)] to-blue-500 will-change-[opacity]"></span>
                <Image src={circleIcon} alt="" />
                <span className="text-sm text-[#c4c4cc]">
                  Conteúdos gratuitos
                </span>
              </a>
            </li>
            <li>
              <a
                href=""
                className="relative p-3 flex space-x-2 rounded-xl px-8 hover:text-white group"
              >
                <span className="absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-[#00c8ff] via-[rgb(0 78 99)] to-blue-500 will-change-[opacity]"></span>
                <span className="text-sm text-[#c4c4cc]">Cursos</span>
              </a>
            </li>
            <li>
              <a
                href=""
                className="relative p-3 flex space-x-2 rounded-xl px-8 hover:text-white group"
              >
                <span className="absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-[#00c8ff] via-[rgb(0 78 99)] to-blue-500 will-change-[opacity]"></span>
                <span className="text-sm text-[#c4c4cc]">Contato</span>
              </a>
            </li>
          </ul>
          <ul className="flex items-center space-x-4 border-l-2 border-[#29292e]">
            {session ? (
              <>
                <li className="ml-4">
                  <Link
                    href="/account"
                    className="flex gap-2 px-4 items-center"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-[#c4c4cc]">
                      {session.user?.name || "Usuário"}
                    </span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => signOut()}
                    className="flex gap-2 px-4 items-center text-sm text-[#c4c4cc] hover:text-white"
                  >
                    <LogOut size={20} />
                    <span>SAIR</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="ml-4">
                  <Link href="/login" className="flex gap-2 px-4">
                    <User size={20} />
                    <span className="text-sm text-[#c4c4cc]">LOGIN</span>
                  </Link>
                </li>
                <li>
                  <Link href="/signup">
                    <PrimaryButton>
                      CADASTRAR
                      <ChevronRight />
                    </PrimaryButton>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </ul>
      </div>
    </div>
  );
}
