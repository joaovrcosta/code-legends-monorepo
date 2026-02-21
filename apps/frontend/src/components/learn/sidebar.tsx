"use client";

import { usePathname } from "next/navigation";
import useSidebarStore from "@/stores/sidebarStore";
import { PuzzlePiece, BookOpenText, CaretRight } from "@phosphor-icons/react";
import Link from "next/link";
import {
  Path,
  Question,
  DiscordLogo,
  CalendarDotsIcon,
  BookBookmarkIcon,
  House,
  Graph,
} from "@phosphor-icons/react/dist/ssr";

const links = [
  { name: "Dashboard", path: "/", icon: House },
  { name: "Aprender", path: "/learn", icon: Path },
  { name: "Catálogo", path: "/learn/catalog", icon: BookOpenText },
  {
    name: "Meu aprendizado",
    path: "/learn/my-learning",
    icon: BookBookmarkIcon,
  },
  { name: "Roadmap", path: "/learn/tracking", icon: Graph },
  { name: "Projetos", path: "/learn/projects", icon: PuzzlePiece },
  { name: "Eventos", path: "/learn/badges", icon: CalendarDotsIcon },
];

const utilLinks = [
  {
    name: "Discord",
    url: "https://discord.gg/codelegends",
    icon: DiscordLogo,
    external: true,
  },
  { name: "Ajuda", url: "/help", icon: Question },
];

const Sidebar = () => {
  const pathName = usePathname();
  const { isOpen } = useSidebarStore();

  return (
    <section
      className={`flex h-full min-h-0 flex-col gap-2 overflow-hidden bg-[#1A1A1E] text-white py-4 transition-all duration-300 ease-in-out ${isOpen ? "w-64" : "w-16"
        }`}
    >
      <div className="min-h-0 flex-1 overflow-hidden">
        <nav className="w-full bg-transparent py-4 px-0 rounded-lg border border-none">
          <ul className="space-y-2">
            {links.map((link) => {
              const isActive = pathName === link.path;
              return (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className={`relative flex text-[14px] items-center h-[52px] px-4 space-x-3 transition-colors overflow-hidden ${isActive
                      ? "bg-blue-gradient-500 text-white font-semibold"
                      : "text-[#C4C4CC] hover:bg-[#2E2E32]"
                      }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center justify-center">
                        <span className="mr-3">
                          <link.icon
                            size={28}
                            weight={isActive ? "fill" : "regular"}
                          />
                        </span>
                        <span className="whitespace-nowrap">
                          {isOpen && link.name}
                        </span>
                      </div>
                      {isActive && <CaretRight size={28} />}
                    </div>
                    {isActive && (
                      <div className="absolute right-0 top-0 h-full w-10 bg-blue-500 blur-xl opacity-50 z-50 will-change-[opacity]"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Links úteis */}
      <div className="border-t border-[#2E2E32] pt-4 px-2">
        <ul className="space-y-2">
          {utilLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.url}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="flex text-[14px] items-center h-[42px] px-2 lg:space-x-3 space-x-0 text-[#C4C4CC] hover:bg-[#2E2E32] rounded-lg transition-colors"
              >
                <span>
                  <link.icon size={24} weight="regular" />
                </span>
                {isOpen && (
                  <span className="whitespace-nowrap">{link.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Sidebar;
