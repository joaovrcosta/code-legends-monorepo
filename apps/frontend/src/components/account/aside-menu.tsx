"use client";

import {
  Album,
  ChevronRight,
  Crown,
  KeyRound,
  LayoutDashboard,
  // LogOut,
  Medal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { name: "Visão Geral", path: "/account", icon: <LayoutDashboard /> },
  {
    name: "Meus Cursos",
    path: "/account/courses",
    icon: <Album />,
  },
  {
    name: "Certificados",
    path: "/account/certificates",
    icon: <Medal />,
  },
  { name: "Assinatura", path: "/account/purchases", icon: <Crown /> },
  { name: "Dados", path: "/account/access", icon: <KeyRound /> },
  // {
  //   name: "Sair da conta",
  //   path: "/",
  //   icon: <LogOut className="text-red-500" />,
  // },
];

export function AccountAsideMenu() {
  const pathName = usePathname();

  return (
    <nav className="w-full h-auto bg-transparent lg:py-4 py-0 mt-8 px-0 rounded-xl shadow-md border border-[#25252A] lg:sticky lg:top-[12vh] lg:w-[338px]">
      <ul className="flex flex-row justify-around lg:flex-col lg:space-y-2">
        <AnimatePresence mode="wait">
          {links.map((link, index) => (
            <li key={`${link.path}-${pathName}`} className="w-full lg:w-auto">
              <Link
                href={link.path}
                className={`flex items-center justify-center lg:justify-start h-[52px] lg:px-4 px-0 transition-colors ${pathName === link.path
                  ? "bg-blue-gradient-500 text-white font-semibold lg:rounded-none rounded-xl"
                  : "text-[#C4C4CC]"
                  }`}
              >
                <div className="flex items-center justify-center lg:justify-between w-full">
                  {/* Ícone */}
                  <span className="mr-0 lg:mr-3">{link.icon}</span>

                  {/* Nome do link - escondido no mobile */}
                  <motion.span
                    key={`text-${link.path}-${pathName}`}
                    className="hidden lg:inline"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{
                      duration: 0.1,
                      delay: index * 0.02,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  >
                    {link.name}
                  </motion.span>

                  {/* Chevron - escondido no mobile */}
                  <motion.span
                    key={`chevron-${link.path}-${pathName}`}
                    className="hidden lg:inline"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      duration: 0.15,
                      delay: index * 0.02 + 0.02,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  >
                    <ChevronRight />
                  </motion.span>
                </div>
              </Link>
            </li>
          ))}
        </AnimatePresence>
      </ul>
    </nav>
  );
}
