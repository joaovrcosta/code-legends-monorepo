import Image from "next/image";
import codeLegendsLogo from "../../../public/code-legends-logo.svg";
import circleIcon from "../../../public/circle.svg";
import { PrimaryButton } from "../ui/primary-button";
import Link from "next/link";

export default function HeaderLogin() {
  return (
    <div className="relative fixed top-0 left-0 w-full z-50 bg-transparent lg:p-10 p-4">
      <div className="relative  mx-auto flex justify-between items-center px-0 md:px-0 md:py-2">
        <Link href="/">
          <Image src={codeLegendsLogo} alt="Code Legends" />
        </Link>

        {/* Menu Hamburger para telas menores */}
        <div className="md:hidden ml-4">
          <Link href="/login" className="flex">
            <PrimaryButton className="w-[110px] bg-transparent h-[46px] border border-[#525252]">
              ENTRAR
            </PrimaryButton>
          </Link>
        </div>

        {/* Menu para telas maiores */}
        <ul className="hidden md:flex xl:space-x-12 space-x-2 items-center">
          <ul className="flex xl:space-x-8  space-x-2 items-center">
            <li className="flex hidden xl:block">
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
            <li className="block xl:hidden">
              <a
                href=""
                className="relative p-3 flex space-x-2 rounded-xl px-8 hover:text-white group"
              >
                <span className="absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-[#00c8ff] via-[rgb(0 78 99)] to-blue-500 will-change-[opacity]"></span>
                <span className="text-sm text-[#c4c4cc]">Login</span>
              </a>
            </li>
          </ul>
          <ul className="flex items-center">
            <li className="flex items-center gap-4">
              <p className="text-[14px] text-[#ffffffbf]">Já tem uma conta?</p>
              <Link href="/login" className="flex">
                <PrimaryButton className="w-[110px] bg-transparent">
                  ENTRAR
                </PrimaryButton>
              </Link>
            </li>
          </ul>
        </ul>
      </div>
    </div>
  );
}
