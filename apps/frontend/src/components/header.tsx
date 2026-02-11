"use client";

import Image from "next/image";
import codeLegendsLogo from "../../public/code-legends-logo.svg";
import codeLegendsLogoMobile from "../../public/logo-mobile.png";
import { ChevronRight, User, Menu } from "lucide-react";
import circleIcon from "../../public/circle.svg";
import { PrimaryButton } from "./ui/primary-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogTitle } from "@radix-ui/react-dialog";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

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
              <DialogTitle className="text-[#c4c4cc]"> </DialogTitle>{" "}
              {/* Adicionando um título acessível */}
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
                <Link
                  href="/login"
                  className="text-[#c4c4cc] p-2 hover:bg-[#202024] rounded-lg flex items-center space-x-2"
                >
                  <User size={20} />
                  <span>LOGIN</span>
                </Link>
                <PrimaryButton>
                  PRÉ-VENDA
                  <ChevronRight />
                </PrimaryButton>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Menu para telas maiores */}
        <ul className="hidden flex space-x-12 items-center lg:flex xl:flex">
          <ul className="flex space-x-8 items-center">
            <li className="flex xl:block hidden">
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
            <li className="ml-4">
              <Link href="/login" className="flex gap-2 px-4">
                <User size={20} />
                <span className="absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-[#00c8ff] via-[rgb(0 78 99)] to-blue-500 will-change-[opacity]"></span>
                <span className="text-sm text-[#c4c4cc]">LOGIN</span>
              </Link>
            </li>
            <li>
              <PrimaryButton>
                INSCREVA-SE
                <ChevronRight />
              </PrimaryButton>
            </li>
          </ul>
        </ul>
      </div>
    </div>
  );
}
