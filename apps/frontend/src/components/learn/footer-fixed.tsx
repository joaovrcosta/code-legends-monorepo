"use client";

import {
  BookOpenText,
  ChartDonut,
  Path,
  PuzzlePiece,
  Sticker,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";

type LinkItem = {
  name: string;
  path: string;
  icon: (isActive: boolean) => ReactNode;
};

const links: LinkItem[] = [
  {
    name: "Cursos",
    path: "/learn/catalog",
    icon: (isActive) => (
      <BookOpenText
        size={34}
        strokeWidth={1}
        weight={isActive ? "fill" : "regular"}
        className={`${
          isActive ? "bg-blue-gradient-500 p-1 rounded-xl" : "text-white"
        }`}
      />
    ),
  },
  // {
  //   name: "HQ",
  //   path: "/learn/hq",
  //   icon: (isActive) => (
  //     <Shield
  //       size={34}
  //       strokeWidth={1}
  //       weight={isActive ? "fill" : "regular"}
  //       className={`${isActive ? "text-[#00c8ff]" : "text-white"}`}
  //     />
  //   ),
  // },
  {
    name: "Estatísticas",
    path: "/learn/progress",
    icon: (isActive) => (
      <ChartDonut
        size={32}
        weight={isActive ? "fill" : "regular"}
        className={`${
          isActive ? "bg-blue-gradient-500 p-1 rounded-xl" : "text-white"
        }`}
      />
    ),
  },
  {
    name: "Home",
    path: "/learn",
    icon: (isActive) => (
      <Path
        size={34}
        strokeWidth={1}
        weight={isActive ? "fill" : "regular"}
        className={`${
          isActive ? "bg-blue-gradient-500 p-1 rounded-xl" : "text-white"
        }`}
      />
    ),
  },
  {
    name: "Casos de uso",
    path: "/learn/use-cases",
    icon: (isActive) => (
      <PuzzlePiece
        size={32}
        weight={isActive ? "fill" : "regular"}
        className={`${
          isActive ? "bg-blue-gradient-500 p-1 rounded-xl" : "text-white"
        }`}
      />
    ),
  },
  {
    name: "Insights",
    path: "/learn/badges",
    icon: (isActive) => (
      <Sticker
        size={34}
        strokeWidth={1}
        weight={isActive ? "fill" : "regular"}
        className={`${
          isActive ? "bg-blue-gradient-500 p-1 rounded-xl" : "text-white"
        }`}
      />
    ),
  },
];

export function FooterFixed() {
  const pathname = usePathname();

  return (
    <footer className="w-full bg-[#121214] border-t-[1px] border-[#25252a] text-white text-center fixed bottom-0 left-0 lg:hidden">
      <ul className="flex justify-around">
        {links.map((link, index) => {
          const isActive = pathname === link.path;

          return (
            <li key={index}>
              <Link href={link.path} className="flex flex-col items-center p-2">
                {link.icon(isActive)}
              </Link>
            </li>
          );
        })}
      </ul>
    </footer>
  );
}
