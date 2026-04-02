'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardHeader } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
} from '@phosphor-icons/react/dist/ssr'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getCompletedCourses } from '@/actions/course/completed'
import { useActiveCourseStore } from '@/stores/active-course-store'
import Image from 'next/image'
import { ChevronRight, LockKeyhole } from 'lucide-react'
import { ProgressRing } from '@/components/classroom/module-progress-ring'
import { LearnUpgradeCard } from '@/components/learn/learn-upgrade-card'
import type { CourseSkillConfigItem } from '@/actions/course/get-course-skills-config'
import type { ModuleLessonGridItem } from '@/lib/module-lesson-overview'
import type { StudyProgramModuleSection } from '@/lib/study-program-overview'

interface CourseOverviewProps {
  tags?: string[]
  courseSkills?: CourseSkillConfigItem[]
  studyProgramModules?: StudyProgramModuleSection[]
  moduleLessons?: ModuleLessonGridItem[]
  resumeLessonHref?: string | null
  currentLesson?: {
    id: number
    title: string
    description?: string | null
    duration: string | null
    progress: number
  } | null
}

export function CourseOverview({
  tags = [],
  courseSkills = [],
  studyProgramModules = [],
  moduleLessons = [],
  resumeLessonHref = null,
  currentLesson = null,
}: CourseOverviewProps) {
  const { data: session, status } = useSession()
  const userPlan = (session?.user as { plan?: string } | undefined)?.plan
  const isPaidUser = userPlan === 'PRO' || userPlan === 'PREMIUM'
  const sessionReady = status !== 'loading'

  const [showMoreSkills, setShowMoreSkills] = useState(false)
  const [isCourseCompleted, setIsCourseCompleted] = useState(false)
  const { activeCourse } = useActiveCourseStore()

  console.log(courseSkills)

  useEffect(() => {
    async function checkCourseCompletion() {
      if (!activeCourse?.id) return
      try {
        const completedCourses = await getCompletedCourses()
        const isCompleted = completedCourses.courses.some(
          (course) => course.id === activeCourse.id,
        )
        setIsCourseCompleted(isCompleted)
      } catch (error) {
        console.error('Erro ao verificar conclusão do curso:', error)
      }
    }
    checkCourseCompletion()
  }, [activeCourse?.id])

  const [showMoreBio, setShowMoreBio] = useState(false)

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
              <div className="rounded-[16px] bg-[#0F0F10]/40 backdrop-blur-sm overflow-hidden">
                {/* Header (estilo clean do print) */}
                <div className="flex items-start gap-4 p-4">
                  <div className="shrink-0 h-12 w-12 rounded-full border border-[#25252A] bg-[#0F0F10] flex items-center justify-center">
                    <span className="text-xs font-semibold text-[#C4C4CC]">
                      {currentLesson?.progress || 0}%
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#00C8FF]/10 text-[#00C8FF]">
                        Aula atual
                      </span>
                      <span className="text-xs text-[#C4C4CC] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {currentLesson?.duration || '0m 0s'} restantes
                      </span>
                    </div>

                    <h4 className="text-base lg:text-[1.375rem] mt-2 font-semibold text-white leading-tight">
                      {currentLesson?.title}
                    </h4>

                    {currentLesson?.description?.trim() ? (
                      <p className="mt-2 text-sm text-[#A1A1AA] line-clamp-2">
                        {currentLesson.description.trim()}
                      </p>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-[#7e7e89] pt-1">
                    <CaretDown size={18} />
                  </div>
                </div>

                {moduleLessons.length > 0 ? (
                  <div className="space-y-1 p-4"> {/* Removido grid, adicionado espaço vertical entre linhas */}
                    {moduleLessons.map((item) => {
                      const badge = (
                        <div className="flex items-center justify-center w-6 shrink-0">
                          {item.isCompleted ? (
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#a8f3d1]">
                              <Check
                                weight="bold"
                                className="h-3 w-3 text-[#0F0F10]"
                              />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-[#25252A]" />
                          )}
                        </div>
                      );

                      const body = (
                        <>
                          {badge}

                          {/* Label da Categoria (Informativo, Lição, etc) */}
                          <span
                            className={`w-28 text-sm shrink-0 ${item.isCurrent ? 'font-semibold text-white' : 'font-medium text-[#8D8D99]'}`}
                          >
                            {item.categoryLabel}
                          </span>

                          {/* Título da Aula */}
                          <p className={`flex-1 text-sm truncate ${item.isCurrent ? 'text-white font-semibold' : 'text-[#939399]'}`}>
                            {item.title}
                          </p>

                          {/* Opcional: Ícone de cadeado se estiver bloqueado */}
                          {item.isLocked && <LockKeyhole className="w-4 h-4 text-[#323238]" />}
                        </>
                      );

                      // Estilo de "Linha" em vez de "Card"
                      const rowClass = 'group flex items-center gap-4 p-3 rounded-xl transition-all duration-200';

                      if (item.isLocked) {
                        return (
                          <div
                            key={item.id}
                            className={`${rowClass} cursor-not-allowed opacity-40`}
                          >
                            {body}
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          prefetch
                          className={`${rowClass} hover:bg-white/[0.03]`}
                        >
                          {body}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}

                {/* Rodapé (CTA) */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-[#25252A] px-5 py-4">
                  <div className="flex items-center gap-3 text-xs text-[#7e7e89]">
                    <span>Progresso da aula</span>
                    <span className="text-white font-semibold">
                      {currentLesson?.progress || 0}%
                    </span>
                  </div>

                  <Button
                    asChild
                    className="h-10 rounded-full bg-blue-gradient-500 hover:shadow-[0_0_12px_#00C8FF] transition-all"
                  >
                    <Link
                      href={resumeLessonHref ?? '/classroom'}
                      prefetch
                    >
                      Retomar <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-[#20232a] rounded-lg p-8 text-center text-[#C4C4CC]">
                <p className="text-center">Nenhuma aula em progresso</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-0 text-white bg-gray-gradient rounded-[20px]">
          <CardHeader className="px-4 py-6 border-b border-[#25252A]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
                  Programa de estudos
                </h3>
                <p className="text-xs text-muted-foreground">
                  {studyProgramModules.length > 0
                    ? `${studyProgramModules.length} módulos`
                    : 'Conteúdo do curso'}
                </p>
              </div>
              {studyProgramModules.length > 0 ? (
                <button
                  type="button"
                  className="text-[12px] text-[#7e7e89] hover:text-white"
                  onClick={() => {
                    document
                      .querySelectorAll<HTMLButtonElement>(
                        'button[data-study-program-trigger][data-state]',
                      )
                      .forEach((el) => el.click())
                  }}
                >
                  Expandir todas as seções
                </button>
              ) : null}
            </div>
          </CardHeader>

          {studyProgramModules.length > 0 ? (
            <Accordion type="multiple" className="divide-y divide-[#25252A]">
              {studyProgramModules.map((section, index) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="p-4"
                >
                  <AccordionTrigger
                    data-study-program-trigger=""
                    className="py-4 hover:no-underline"
                  >
                    <div className="flex items-center gap-3 text-left w-full">
                      <ProgressRing
                        progress={section.progress}
                        moduleNumber={index + 1}
                        size={44}
                        strokeWidth={2.5}
                        progressColor="stroke-[#00C8FF]"
                        trackColor="stroke-[#25252A]"
                        padModuleNumber={false}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">
                          {section.title}
                        </p>
                        <p className="text-xs text-[#C4C4CC] line-clamp-1">
                          {section.subtitle}
                        </p>
                      </div>
                      <CaretDown
                        size={18}
                        className="text-[#7e7e89] shrink-0 data-[state=open]:rotate-180 transition-transform"
                      />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-14 text-sm text-[#C4C4CC]">
                    <ul className="space-y-2">
                      {section.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          {lesson.isLocked ? (
                            <span className="flex items-center gap-1.5 text-[#7e7e89]">
                              <Lock className="h-3.5 w-3.5 shrink-0" />-
                              {lesson.categoryLabel} • {lesson.title}
                            </span>
                          ) : (
                            <Link
                              href={lesson.href}
                              prefetch
                              className="block hover:text-[#00C8FF] transition-colors"
                            >
                              - {lesson.categoryLabel} • {lesson.title}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-[#7e7e89]">
              Faça login para ver o programa de estudos completo deste curso.
            </div>
          )}
        </Card>

        <Card className="p-0 text-whit bg-gray-gradient rounded-[20px]">
          <CardHeader className="px-4 py-6 border-b border-[#25252A]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
                  Skills que você vai evoluir
                </h3>
              </div>
            </div>
          </CardHeader>
          <div className="px-4 py-6">
            {courseSkills.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {(showMoreSkills ? courseSkills : courseSkills.slice(0, 4)).map(
                    (skill) => (
                      <div
                        key={skill.skillId}
                        className="flex items-start gap-2"
                      >
                        <Check
                          size={20}
                          className="text-[#00C8FF] flex-shrink-0 mt-0.5"
                        />
                        <p className="text-sm text-[#C4C4CC]">{skill.name}</p>
                      </div>
                    ),
                  )}
                </div>
                {courseSkills.length > 4 ? (
                  <button
                    type="button"
                    onClick={() => setShowMoreSkills(!showMoreSkills)}
                    className="mt-4 text-sm text-[#00C8FF] hover:text-[#00a8d4] flex items-center gap-1"
                  >
                    {showMoreSkills ? 'Mostrar menos' : 'Mostrar mais'}
                    <CaretDown
                      size={16}
                      className={`transition-transform ${showMoreSkills ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-[#7e7e89] text-center md:text-left">
                As skills deste curso serão exibidas aqui quando estiverem
                cadastradas na plataforma.
              </p>
            )}
          </div>
        </Card>

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
                    ? 'Sou desenvolvedor web com experiência em JavaScript, TypeScript, Node.js e React.js. Ao longo da minha carreira, colaborei com diversos setores, incluindo agências de publicidade, consultorias, startups e escolas de programação.'
                    : 'Sou desenvolvedor web com experiência em JavaScript, TypeScript...'}
                </p>
                <button
                  onClick={() => setShowMoreBio(!showMoreBio)}
                  className="mt-2 text-sm text-[#00C8FF] hover:text-[#00a8d4] flex items-center gap-1"
                >
                  {showMoreBio ? 'Ler menos' : 'Ler mais'}
                  <CaretDown
                    size={16}
                    className={`transition-transform ${showMoreBio ? 'rotate-180' : ''
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
        {sessionReady && !isPaidUser && <LearnUpgradeCard />}
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
                  <span className="text-xs text-[#7e7e89]">
                    Nenhuma tag disponível
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 relative">
              <div className="relative">
                <Image
                  src="/certificate-image.png"
                  alt="Certificado"
                  width={500}
                  height={100}
                />
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
                    <span className="text-white text-lg font-semibold">
                      Bloqueado
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
