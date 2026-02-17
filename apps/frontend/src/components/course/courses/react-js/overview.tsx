"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CaretDown,
  Check,
  GithubLogo,
  LinkedinLogo,
  Clock,
  VideoCamera,
  GraduationCap,
  Calendar,
  Question,
  Lock,
  Play,
} from "@phosphor-icons/react/dist/ssr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCompletedCourses } from "@/actions/course/completed";
import { useActiveCourseStore } from "@/stores/active-course-store";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface CourseOverviewProps {
  tags?: string[];
  currentLesson?: {
    id: number;
    title: string;
    duration: string | null;
    progress: number;
  } | null;
}

export function CourseOverview({ tags = [], currentLesson = null }: CourseOverviewProps) {
  const [showMore, setShowMore] = useState(false);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const { activeCourse } = useActiveCourseStore();

  useEffect(() => {
    async function checkCourseCompletion() {
      if (!activeCourse?.id) return;
      try {
        const completedCourses = await getCompletedCourses();
        const isCompleted = completedCourses.courses.some(
          (course) => course.id === activeCourse.id
        );
        setIsCourseCompleted(isCompleted);
      } catch (error) {
        console.error("Erro ao verificar conclusão do curso:", error);
      }
    }
    checkCourseCompletion();
  }, [activeCourse?.id]);

  const learningTopics = [
    "JavaScript e ES6+ fundamentals",
    "Componentes funcionais e hooks",
    "Gerenciamento de estado com Context API",
    "Roteamento com React Router",
    "Consumo de APIs REST",
    "Testes com Jest e React Testing Library",
    "Otimização de performance",
    "Deploy de aplicações React",
  ];
  const curriculum = [
    {
      id: "1",
      title: "Primeiros passos com React",
      description:
        "Entenda o que é React e configure o ambiente para iniciar seu projeto.",
    },
    {
      id: "2",
      title: "Componentes, props e estado",
      description:
        "Aprenda a criar componentes reutilizáveis, controlar estado e passar props.",
    },
    {
      id: "3",
      title: "Roteamento e requisições",
      description:
        "Implemente rotas e faça requisições HTTP para buscar e enviar dados.",
    },
  ];

  const [showMoreBio, setShowMoreBio] = useState(false);

  return (
    <div className="flex lg:flex-row flex-col gap-8 mt-8">
      <div className="w-full max-w-[1240px] space-y-4">

        <Card className="p-0 text-whit bg-gray-gradient rounded-[20px]">
          <CardHeader className="px-4 py-6 border-b border-[#25252A]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
                  Continue de onde parou
                </h3>
              </div>
            </div>
          </CardHeader>
          <div className="px-4 py-6">
            {currentLesson ? (
              <div className="group relative flex flex-col md:flex-row gap-6 bg-[#25252b] rounded-[20px] p-4 border border-transparent hover:border-[#00C8FF]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C8FF]/10 cursor-pointer">

                {/* 1. Thumbnail com Overlay de Play e Efeito de Zoom */}
                <div className="relative h-[200px] md:w-[320px] w-full shrink-0 rounded-xl overflow-hidden">
                  {/* Imagem de fundo */}
                  <Image
                    src="/thumbnail-react.webp"
                    alt="React Logo"
                    fill // Usa fill para ocupar o container pai
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay Escuro no Hover */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                </div>

                {/* 2. Informações e Ações */}
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    {/* Cabeçalho Pequeno: Módulo ou Categoria */}
                    <div className="flex items-center gap-2 mb-2 mt-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#00C8FF]/10 text-[#00C8FF]">
                        Módulo 01
                      </span>
                      <span className="text-xs text-[#C4C4CC] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {currentLesson?.duration || "0m 0s"} restantes
                      </span>
                    </div>

                    {/* Título Principal */}
                    <h4 className="text-2xl font-semibold text-white mb-2 leading-tight group-hover:text-[#00C8FF] transition-colors">
                      {currentLesson?.title}
                    </h4>

                    <p className="text-sm text-[#8D8D99] line-clamp-2">
                      Nesta aula vamos aprender os conceitos fundamentais sobre...
                    </p>
                  </div>

                  {/* Área Inferior: Progresso e Botão de Ação */}
                  <div className="mt-6">
                    <div className="flex justify-between text-xs text-[#C4C4CC] mb-2 font-medium">
                      <span>Progresso da aula</span>
                      <span>{currentLesson?.progress || 0}%</span>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full h-1.5 bg-[#25252A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00C8FF] to-[#00FF88] shadow-[0_0_10px_rgba(0,200,255,0.5)] transition-all duration-500 ease-out"
                        style={{ width: `${currentLesson?.progress || 0}%` }}
                      />
                    </div>

                    {/* Call to Action (CTA) Móvel ou Botão "Continuar" */}
                    <div className="mt-4 flex md:hidden items-center text-[#00C8FF] text-sm font-semibold">
                      Continuar assistindo <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#20232a] rounded-lg p-8 text-center text-[#C4C4CC]">
                <p className="text-center">Nenhuma aula em progresso</p>
              </div>
            )}
          </div>
        </Card>
        {/* Section 1: O que você aprenderá */}
        <Card className="p-0 text-whit bg-gray-gradient rounded-[20px]">
          <CardHeader className="px-4 py-6 border-b border-[#25252A]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
                  O que você aprendera
                </h3>
              </div>
            </div>
          </CardHeader>
          <div className="px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {(showMore ? learningTopics : learningTopics.slice(0, 4)).map(
                (topic, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check
                      size={20}
                      className="text-[#00C8FF] flex-shrink-0 mt-0.5"
                    />
                    <p className="text-sm text-[#C4C4CC]">{topic}</p>
                  </div>
                )
              )}
            </div>
            {learningTopics.length > 4 && (
              <button
                onClick={() => setShowMore(!showMore)}
                className="mt-4 text-sm text-[#00C8FF] hover:text-[#00a8d4] flex items-center gap-1"
              >
                {showMore ? "Mostrar menos" : "Mostrar mais"}
                <CaretDown
                  size={16}
                  className={`transition-transform ${showMore ? "rotate-180" : ""
                    }`}
                />
              </button>
            )}
          </div>
        </Card>

        {/* Section 2: Programa de Estudos */}
        <Card className="p-0 text-white bg-gray-gradient rounded-[20px]">
          <CardHeader className="px-4 py-6 border-b border-[#25252A]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
                  Programa de estudos
                </h3>
                <p className="text-xs text-muted-foreground">
                  {curriculum.length} módulos
                </p>
              </div>
              <button
                type="button"
                className="text-[12px] text-[#7e7e89] hover:text-white"
                onClick={() => {
                  const details = document.querySelectorAll<HTMLDivElement>(
                    "[data-accordion][data-state]"
                  );
                  details.forEach((d) => d.click());
                }}
              >
                Expandir todas as seções
              </button>
            </div>
          </CardHeader>

          <Accordion type="multiple" className="divide-y divide-[#25252A]">
            {curriculum.map((section, index) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="px-3 py-4"
              >
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex items-center gap-3 text-left w-full">
                    <div className="h-8 w-8 rounded-full bg-[#0F0F10] border border-[#25252A] flex items-center justify-center text-[12px] text-[#C4C4CC]">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {section.title}
                      </p>
                      <p className="text-xs text-[#C4C4CC] line-clamp-1">
                        {section.description}
                      </p>
                    </div>
                    <CaretDown
                      size={18}
                      className="text-[#7e7e89] data-[state=open]:rotate-180 transition-transform"
                    />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14 text-sm text-[#C4C4CC]">
                  <ul className="space-y-2">
                    <li>- Aula 1 • Introdução e setup</li>
                    <li>- Aula 2 • Conceitos base</li>
                    <li>- Quiz • Revisão do módulo</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Section 3: Educador */}
        <Card className="p-0 text-white bg-gray-gradient rounded-[20px]">
          <CardHeader className="px-4 py-6 border-b border-[#25252A]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
                  Educador
                </h3>
              </div>
            </div>
          </CardHeader>
          <div className="px-4 py-6">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="https://avatars.githubusercontent.com/u/70654718?v=4" />
                <AvatarFallback>JG</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-base font-semibold text-white mb-1">
                      João Victor
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Software Engineer • TypeScript • ReactJS • NodeJS
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="h-[36px] w-[36px] flex items-center justify-center rounded-lg border border-[#25252A] hover:bg-[#25252A] transition-colors">
                      <GithubLogo size={20} className="text-[#C4C4CC]" />
                    </button>
                    <button className="h-[36px] w-[36px] flex items-center justify-center rounded-lg border border-[#25252A] hover:bg-[#25252A] transition-colors">
                      <LinkedinLogo size={20} className="text-[#C4C4CC]" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[#C4C4CC] leading-relaxed">
                  {showMoreBio
                    ? "Sou desenvolvedor web com experiência em JavaScript, TypeScript, Node.js e React.js. Ao longo da minha carreira, colaborei com diversos setores, incluindo agências de publicidade, consultorias, startups e escolas de programação."
                    : "Sou desenvolvedor web com experiência em JavaScript, TypeScript..."}
                </p>
                <button
                  onClick={() => setShowMoreBio(!showMoreBio)}
                  className="mt-2 text-sm text-[#00C8FF] hover:text-[#00a8d4] flex items-center gap-1"
                >
                  {showMoreBio ? "Ler menos" : "Ler mais"}
                  <CaretDown
                    size={16}
                    className={`transition-transform ${showMoreBio ? "rotate-180" : ""
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 4: Detalhes */}
        <Card className="p-0 text-white bg-gray-gradient rounded-[20px]">
          <CardHeader className="px-4 py-6 border-b border-[#25252A]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
                  Detalhes
                </h3>
              </div>
            </div>
          </CardHeader>
          <div className="px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Horas de estudo */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#1A1A1E] flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-[#00C8FF]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-xs text-[#C4C4CC]">Horas de estudo</p>
                    <Question
                      size={12}
                      className="text-[#7e7e89] cursor-help"
                    />
                  </div>
                  <p className="text-base font-semibold text-white">
                    Aprox. 2h
                  </p>
                </div>
              </div>

              {/* Aulas */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#1A1A1E] flex items-center justify-center flex-shrink-0">
                  <VideoCamera size={20} className="text-[#00C8FF]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#C4C4CC] mb-1">Aulas</p>
                  <p className="text-base font-semibold text-white">
                    13 aulas em 1h 14min
                  </p>
                </div>
              </div>

              {/* Alunos desta trilha */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#1A1A1E] flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={20} className="text-[#00C8FF]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#C4C4CC] mb-1">
                    Alunos desta trilha
                  </p>
                  <p className="text-base font-semibold text-white">1.888</p>
                </div>
              </div>

              {/* Fim do acesso */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#1A1A1E] flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="text-[#00C8FF]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#C4C4CC] mb-1">Fim do acesso</p>
                  <p className="text-base font-semibold text-white">
                    03/11/2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="max-w-[500px] w-full space-y-4 lg:sticky lg:top-[100px] lg:h-fit">
        <Card className="p-0 text-white bg-gray-gradient rounded-[20px]">
          <CardHeader className="px-4 py-6 border-b border-[#25252A]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
                  Informações
                </h3>
              </div>
            </div>
          </CardHeader>
          <div className="px-4 py-6 space-y-4">
            <div>
              <p className="text-xs text-[#C4C4CC] mb-2">Nível</p>
              <p className="text-sm font-semibold text-white">Intermediário</p>
            </div>

            <div>
              <p className="text-xs text-[#C4C4CC] mb-2">Certificado</p>
              {isCourseCompleted ? (
                <Link
                  href="/account/certificates"
                  className="text-sm font-semibold text-[#00c8ff] hover:underline cursor-pointer transition-colors"
                >
                  Disponível
                </Link>
              ) : (
                <p className="text-sm font-semibold text-white">Disponível</p>
              )}
            </div>

            <div>
              <p className="text-xs text-[#C4C4CC] mb-2">Tempo estimado</p>
              <p className="text-sm font-semibold text-white">20 horas</p>
            </div>

            <div>
              <p className="text-xs text-[#C4C4CC] mb-2">Tecnologias</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {tags.length > 0 ? (
                  tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 text-xs bg-[#1A1A1E] rounded-full text-[#ffffff] font-semibold"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#7e7e89]">Nenhuma tag disponível</span>
                )}
              </div>
            </div>

            <div className="mt-4 relative">
              <div className="relative">
                <Image src="/certificate-image.png" alt="Certificado" width={500} height={100} />
                {isCourseCompleted ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-[20px]">
                    <Button
                      asChild
                      className="bg-[#00C8FF] hover:bg-[#00a8d4] text-white font-semibold"
                    >
                      <Link href="/account/certificates">
                        Gerar Certificado
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center rounded-[20px]">
                    <Lock size={24} className="text-white mr-2" />
                    <span className="text-white text-lg font-semibold">Bloqueado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
