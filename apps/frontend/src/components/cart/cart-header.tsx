"use client";

import Link from "next/link";
import Image from "next/image";
import codeLegendsLogo from "../../../public/code-legends-logo.svg";

export function CartHeader() {
  return (
    <header className="flex justify-center mb-10">
      <Link
        href="/learn"
        className="text-xl font-bold bg-blue-gradient-500 bg-clip-text text-transparent"
      >
        <Image
          src={codeLegendsLogo}
          alt="Code Legends"
          width={100}
          height={100}
          className="w-auto h-auto"
        />
      </Link>
    </header>
  );
}
