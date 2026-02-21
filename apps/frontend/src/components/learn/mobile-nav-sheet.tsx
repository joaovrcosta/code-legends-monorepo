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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMobileNavStore } from "@/stores/mobile-nav-store";

const links = [
  { name: "Cursos", path: "/learn/catalog", icon: BookOpenText },
  { name: "Estatísticas", path: "/learn/progress", icon: ChartDonut },
  { name: "Home", path: "/learn", icon: Path },
  { name: "Casos de uso", path: "/learn/use-cases", icon: PuzzlePiece },
  { name: "Insights", path: "/learn/badges", icon: Sticker },
];

export function MobileNavSheet() {
  const pathname = usePathname();
  const { isOpen, close } = useMobileNavStore();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="left"
        className="w-[280px] border-[#25252a] bg-[#121214] p-0"
      >
        <SheetHeader className="border-b border-[#25252a] px-4 py-4 text-left">
          <SheetTitle className="text-white">Menu</SheetTitle>
        </SheetHeader>
        <nav className="py-4">
          <ul className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.path;
              const Icon = link.icon;
              return (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    onClick={close}
                    className={`flex items-center gap-3 px-4 py-3 text-[15px] transition-colors ${
                      isActive
                        ? "bg-blue-gradient-500 font-semibold text-white"
                        : "text-[#C4C4CC] hover:bg-[#2E2E32]"
                    }`}
                  >
                    <Icon
                      size={24}
                      weight={isActive ? "fill" : "regular"}
                      className="shrink-0"
                    />
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
