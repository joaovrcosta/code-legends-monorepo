"use client";

import {
  Album,
  ChevronRight,
  Crown,
  KeyRound,
  LayoutDashboard,
  // LogOut,
  Medal,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { name: "Visão Geral", path: "/account", icon: LayoutDashboard },
  {
    name: "Meus Cursos",
    path: "/account/courses",
    icon: Album,
  },
  {
    name: "Certificados",
    path: "/account/certificates",
    icon: Medal,
  },
  { name: "Assinatura", path: "/account/purchases", icon: Crown },
  { name: "Dados de acesso", path: "/account/access", icon: KeyRound },
  { name: "Dados pessoais", path: "/account/personal-data", icon: User },
  // {
  //   name: "Sair da conta",
  //   path: "/",
  //   icon: LogOut,
  // },
];

export function AccountAsideMenu() {
  const pathName = usePathname();

  // Verifica se o path atual corresponde ao link (incluindo sub-rotas)
  const isActive = (path: string) => {
    if (path === "/account") {
      return pathName === "/account";
    }
    return pathName.startsWith(path);
  };

  return (
    <aside className="w-full lg:w-[338px] flex-shrink-0 mt-8">
      <nav className="w-full bg-transparent lg:py-4 py-0 rounded-xl shadow-md border border-[#25252A] lg:sticky lg:top-[12vh] lg:max-h-[calc(100vh-12vh-2rem)] lg:overflow-y-auto">
        <ul className="flex flex-row justify-around lg:flex-col lg:space-y-1 lg:p-2">
          <AnimatePresence mode="wait">
            {links.map((link, index) => {
              const active = isActive(link.path);
              const IconComponent = link.icon;

              return (
                <li key={`${link.path}-${pathName}`} className="w-full lg:w-auto">
                  <Link
                    href={link.path}
                    className={`
                      flex items-center justify-center lg:justify-start 
                      h-[52px] lg:px-4 px-0 
                      transition-all duration-200
                      rounded-xl lg:rounded-[16px]
                      ${active
                        ? "bg-blue-gradient-500 text-white font-semibold"
                        : "text-[#C4C4CC] hover:text-white hover:bg-[#1A1A1E]"
                      }
                    `}
                  >
                    <div className="flex items-center justify-center lg:justify-between w-full gap-2">
                      {/* Ícone */}
                      <span className="flex-shrink-0">
                        <IconComponent
                          className={`w-5 h-5 ${active ? "text-white" : "text-[#C4C4CC]"}`}
                        />
                      </span>

                      {/* Nome do link - escondido no mobile */}
                      <motion.span
                        key={`text-${link.path}-${pathName}`}
                        className="hidden lg:inline flex-1 text-sm font-medium"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{
                          duration: 0.15,
                          delay: index * 0.02,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                      >
                        {link.name}
                      </motion.span>

                      {/* Chevron - escondido no mobile */}
                      {active && (
                        <motion.span
                          key={`chevron-${link.path}-${pathName}`}
                          className="hidden lg:inline flex-shrink-0"
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -5 }}
                          transition={{
                            duration: 0.15,
                            delay: index * 0.02 + 0.05,
                            ease: [0.16, 1, 0.3, 1]
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </AnimatePresence>
        </ul>
      </nav>
    </aside>
  );
}
