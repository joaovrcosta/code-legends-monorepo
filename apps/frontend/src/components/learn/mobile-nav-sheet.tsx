"use client";

import {
  BookOpenText,
  House,
  BookBookmark,
  Graph,
  PuzzlePiece,
  CalendarDots,
  Question,
  DiscordLogo,
  CaretRight,
  Path,
  X,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMobileNavStore } from "@/stores/mobile-nav-store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import codeLegendsLogo from "../../../public/code-legends-logo.svg";

const PROGRESSO_LINKS = [
  { name: "Meus conteúdos", path: "/learn/my-learning", icon: BookBookmark },
  { name: "Aprender", path: "/learn", icon: Path },
  { name: "Minha Jornada", path: "/learn/tracking", icon: Graph },
];

const APRENDIZADO_LINKS = [
  { name: "Catálogo", path: "/learn/catalog", icon: BookOpenText },
  { name: "Projetos", path: "/learn/projects", icon: PuzzlePiece },
  { name: "Eventos", path: "/learn/badges", icon: CalendarDots },
];

const BOTTOM_LINKS = [
  {
    name: "Comunidade",
    path: "https://discord.gg/codelegends",
    icon: DiscordLogo,
    external: true,
  },
  { name: "Ajuda", path: "/help", icon: Question, external: false },
];

function NavLink({
  href,
  icon: Icon,
  children,
  isActive,
  onClick,
  external,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; weight?: "fill" | "regular"; className?: string }>;
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  external?: boolean;
}) {
  const content = (
    <>
      <Icon
        size={20}
        weight={isActive ? "fill" : "regular"}
        className={cn(
          "shrink-0 transition-colors duration-300",
          isActive ? "text-sky-400" : "text-zinc-500 group-hover:text-sky-400"
        )}
      />
      <span className="flex-1 font-medium">{children}</span>
      {external && <CaretRight size={16} weight="bold" className="text-zinc-600 -rotate-45 group-hover:text-zinc-400 transition-colors" />}
    </>
  );

  const className = cn(
    "group flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 rounded-xl outline-none",
    isActive
      ? "bg-sky-500/10 text-white ring-1 ring-inset ring-sky-500/20"
      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {content}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">
      {children}
    </p>
  );
}

export function MobileNavSheet() {
  const pathname = usePathname();
  const { isOpen, close } = useMobileNavStore();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="left"
        className="w-[90vw] border-r border-white/10 bg-[#1a1a1e]/80 backdrop-blur-2xl p-0 flex flex-col [&>button]:hidden shadow-2xl"
      >
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>

        <div className="flex items-center gap-4 border-b border-white/5 px-4 py-5 shrink-0">
          <button
            type="button"
            onClick={close}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
            aria-label="Fechar menu"
          >
            <X size={18} weight="bold" />
          </button>
          <Image src={codeLegendsLogo} alt="Code Legends" width={180} height={40} className="opacity-90" />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6 flex flex-col gap-8 custom-scrollbar">

          <div>
            <NavLink
              href="/"
              icon={House}
              isActive={pathname === "/"}
              onClick={close}
            >
              Home
            </NavLink>
          </div>

          {/* PROGRESSO */}
          <nav className="flex flex-col">
            <SectionLabel>Progresso</SectionLabel>
            <ul className="space-y-1">
              {PROGRESSO_LINKS.map((link) => (
                <li key={link.path}>
                  <NavLink
                    href={link.path}
                    icon={link.icon}
                    isActive={pathname === link.path}
                    onClick={close}
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* APRENDIZADO */}
          <nav className="flex flex-col">
            <SectionLabel>Aprendizado</SectionLabel>
            <ul className="space-y-1">
              {APRENDIZADO_LINKS.map((link) => (
                <li key={link.path}>
                  <NavLink
                    href={link.path}
                    icon={link.icon}
                    isActive={pathname === link.path}
                    onClick={close}
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Links inferiores fixos no rodapé */}
        <div className="border-t border-white/5 bg-black/20 px-3 py-4 shrink-0">
          <ul className="space-y-1">
            {BOTTOM_LINKS.map((link) => (
              <li key={link.name}>
                <NavLink
                  href={link.path}
                  icon={link.icon}
                  isActive={false}
                  onClick={close}
                  external={link.external}
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}