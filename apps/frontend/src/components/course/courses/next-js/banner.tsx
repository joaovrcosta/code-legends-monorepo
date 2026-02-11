"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import reactIcon from "../../../../../public/react-icon.svg";
import { Progress } from "@/components/ui/progress";
import { usePathname } from "next/navigation";

export function NextCourseBanner() {
  const pathName = usePathname();

  return (
    <>
      <section className="bg-gray-gradient border border-[#25252A] lg:p-14 xl:p-14 px-4 py-4 flex items-center rounded-lg">
        <div className="lg:block hidden">
          <Image src={reactIcon} alt="ReactJS" width={120} height={120} />
        </div>
        <div className="flex flex-col lg:ml-4">
          <Link href="/learn/catalog">
            <div className="flex items-center gap-2 cursor-pointer mb-2 text-sm text-[#7e7e89]">
              <ArrowLeft size={16} className="text-[#7e7e89]" />
              Voltar
            </div>
          </Link>
          <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent lg:text-2xl text-xl">
            NextJS
          </span>
          <p className="lg:text-base text-sm">
            Desenvolva interfaces modernas e reativas na web utilizando uma
            biblioteca modular e escalável.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-between mt-4 mb-4">
        <ul className="flex gap-3 mt-4 mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {[
            { href: "/paths/next-js", label: "Curso" },
            { href: "/paths/next-js/quizes", label: "Quizes" },
            { href: "/paths/next-js/materials", label: "Material" },
            { href: "/paths/next-js/projects", label: "Projetos" },
          ].map(({ href, label }) => (
            <li
              key={href}
              className={`flex items-center justify-center p-3 h-[42px] min-w-[90px] text-lg ${
                pathName === href ? "border-b-[1px] border-[#00C8FF]" : ""
              }`}
            >
              <Link href={href}>
                <p>{label}</p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4 md:block hidden">
          <Progress value={46} />
          <p className="text-sm">33% completo</p>
        </div>
      </section>
      <div className="flex-col items-center gap-4 md:hidden justify-center pb-6">
        <Progress value={46} className="w-full" />
        <p className="text-sm text-center mt-3">46% completo</p>
      </div>
    </>
  );
}
