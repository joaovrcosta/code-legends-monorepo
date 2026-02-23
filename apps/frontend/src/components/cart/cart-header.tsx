"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import codeLegendsLogo from "../../../public/code-legends-logo.svg";

export function CartHeader() {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between mb-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-[#C4C4CC] hover:text-white transition-colors shrink-0"
      >
        <CaretLeft size={20} weight="bold" />
        Voltar
      </button>
      <Link
        href="/learn"
        className="text-xl font-bold bg-blue-gradient-500 bg-clip-text text-transparent flex-1 flex justify-center"
      >
        <Image
          src={codeLegendsLogo}
          alt="Code Legends"
          width={100}
          height={100}
          className="w-auto h-auto"
        />
      </Link>
      <div className="w-[72px] shrink-0" aria-hidden />
    </header>
  );
}
