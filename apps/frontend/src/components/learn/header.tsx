"use client";

import Image from "next/image";
import codeLegendsLogo from "../../../public/code-legends-logo.svg";
import codeLegendsLogoMobile from "../../../public/logo-mobile.png";
import Link from "next/link";
import { ListEnd, Menu, Search } from "lucide-react";
import useSidebarStore from "@/stores/sidebarStore";
import { useMobileNavStore } from "@/stores/mobile-nav-store";
import { MobileNavSheet } from "./mobile-nav-sheet";
import { usePathname } from "next/navigation";
import { CourseDropdownMenu } from "./course-menu";
import type { EnrolledCourse, ActiveCourse } from "@/types/user-course.ts";
import { UserDropdown } from "../user-dropdown";
import { StrikeSection } from "../strike-section";
import { useEffect, useState, useCallback } from "react";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { searchCourses } from "@/actions/course/search-courses";
import { CourseWithCount } from "@/types/user-course.ts";
import { Loader2 } from "lucide-react";
import { NotificationsSection } from "../notifications-section";

interface LearnHeaderProps {
  initialUserCourses: EnrolledCourse[];
  initialActiveCourse: ActiveCourse | null;
}

export default function LearnHeader({
  initialUserCourses,
  initialActiveCourse,
}: LearnHeaderProps) {
  const { toggleSidebar, isOpen } = useSidebarStore();
  const openMobileNav = useMobileNavStore((s) => s.open);
  const pathName = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CourseWithCount[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Evita problemas de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  const showSidebarButton = !mounted || (pathName && typeof pathName === 'string' && !pathName.startsWith("/account"));

  // Função de busca com debounce
  const performSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery || trimmedQuery.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchCourses(trimmedQuery);
      setSearchResults(data.courses);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce da pesquisa
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 500); // Aguarda 500ms após o usuário parar de digitar

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // Limpa os resultados quando o modal fecha
  useEffect(() => {
    if (!isSearchModalOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isSearchModalOpen]);

  return (
    <div
      className="learn-header fixed left-0 w-full z-50 bg-[#121214] shadow-lg border-b-[1px] border-[#25252a] lg:py-0 py-2"
      style={{ top: "calc(var(--top-banner-height) + var(--header-top-offset))" }}
    >
      <ul className="flex justify-between items-center gap-2 lg:gap-0 lg:pt-4 pt-0 lg:pb-4 pb-0 w-full mx-auto px-4 sm:px-5">
        <li className="flex min-w-0 shrink-0 items-center lg:space-x-3">
          {showSidebarButton && (
            <button
              onClick={toggleSidebar}
              className="text-white p-1 border border-[#25252a] rounded-lg lg:block hidden hover:bg-[#25252a] transition-all duration-150 ease-in-out"
            >
              {isOpen ? (
                <>
                  <ListEnd size={24} />
                </>
              ) : (
                <>
                  <Menu size={24} />
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={openMobileNav}
            className="text-white p-1.5 border mr-4 border-[#25252a] rounded-lg hover:bg-[#25252a] transition-all duration-150 ease-in-out lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center space-x-4">
            {/* <LoggedSheet /> */}

            <div>
              <Link href="/">
                <Image
                  src={codeLegendsLogo}
                  alt="Code Legends"
                  className="lg:block hidden"
                />
              </Link>
              <Link href="/">
                <Image
                  src={codeLegendsLogoMobile}
                  alt="Code Legends"
                  className="lg:hidden block"
                  height={24}
                  width={24}
                />
              </Link>
            </div>
          </div>
        </li>

        <li className="flex-none sm:min-w-0 sm:flex-1 sm:max-w-[478px] mx-1 sm:mx-4">
          <div
            className="relative cursor-pointer w-full max-w-[42px] sm:max-w-none"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <Input
              placeholder="Pesquisar"
              readOnly
              className="cursor-pointer h-[42px] w-full hidden sm:block rounded-full hover:bg-[#25252a] transition-all duration-150 ease-in-out"
            />
            <button className="flex sm:hidden items-center justify-center h-[42px] w-[42px] shrink-0 rounded-lg border border-[#25252a] hover:bg-[#25252a] transition-all duration-150 ease-in-out">
              <Search size={24} className="text-[#c4c4cc]" />
            </button>
            <Search
              size={24}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c4cc] pointer-events-none hidden sm:block"
            />
          </div>
        </li>

        <li className="flex min-w-0 shrink-0 items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden lg:block">
              <CourseDropdownMenu
                initialUserCourses={initialUserCourses}
                initialActiveCourse={initialActiveCourse}
              />
            </div>
            <StrikeSection />

            <NotificationsSection />

            {/* <div className="flex items-center space-x-2">
              <Brain size={24} weight="fill" className="text-[#00C8FF]" />
              <span>8</span>
            </div> */}

            <div>
              <UserDropdown />
            </div>
          </div>
        </li>
      </ul>

      <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
        <DialogContent className="max-w-[768px] bg-[#121214]">
          <DialogHeader>
            <DialogTitle className="text-white text-xl mb-4">
              O que esta buscando?
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Input
              placeholder="Digite sua pesquisa..."
              className="w-full pr-10 h-[42px] rounded-full hover:bg-[#25252a] transition-all duration-150 ease-in-out"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching ? (
              <Loader2
                size={24}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c4cc] animate-spin"
              />
            ) : (
              <Search
                size={24}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c4cc] pointer-events-none"
              />
            )}
          </div>
          <div className="mt-6 max-h-[400px] overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-[#c4c4cc] animate-spin" size={24} />
              </div>
            ) : searchQuery.trim().length === 0 ? (
              <p className="text-white/60 text-sm text-center py-8">
                Digite algo para pesquisar cursos...
              </p>
            ) : searchQuery.trim().length < 3 ? (
              <p className="text-white/60 text-sm text-center py-8">
                Digite pelo menos 3 caracteres para pesquisar
              </p>
            ) : searchResults.length === 0 ? (
              <p className="text-white/60 text-sm text-center py-8">
                Nenhum curso encontrado para &quot;{searchQuery}&quot;
              </p>
            ) : (
              <div className="space-y-3">
                {searchResults.map((course) => (
                  <Link
                    key={course.id}
                    href={`/learn/paths/${course.slug}`}
                    onClick={() => setIsSearchModalOpen(false)}
                  >
                    <div className="flex items-center gap-4 p-4 mb-3 rounded-lg border border-[#25252A] hover:border-[#35BED5] hover:bg-[#1A1A1E] transition-colors cursor-pointer">
                      {course.icon && (
                        <Image
                          src={course.icon}
                          alt={course.title}
                          width={48}
                          height={48}
                          className="rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm truncate">
                          {course.title}
                        </h3>
                        <p className="text-white/60 text-xs mt-1 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {course.instructor && (
                            <span className="text-[#35BED5] text-xs">
                              {course.instructor.name}
                            </span>
                          )}
                          {course.level && (
                            <>
                              <span className="text-white/40 text-xs">•</span>
                              <span className="text-white/60 text-xs capitalize">
                                {course.level}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MobileNavSheet />
    </div>
  );
}
