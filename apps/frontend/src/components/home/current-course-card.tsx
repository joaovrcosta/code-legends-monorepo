import { getDisplayActiveCourse } from '@/actions/user/get-active-course'
import Image from 'next/image'
import Link from 'next/link'
import { Progress } from '../ui/progress'
import { BarbellIcon, Plus, Trophy } from '@phosphor-icons/react/dist/ssr'
import { ContinueCourseButton } from './continue-course-button'
import { getUserCourseProgress } from '@/actions/progress'
import { ShineBorder } from '../ui/border-beam'

export async function CurrentCourseCard() {
  const activeCourse = await getDisplayActiveCourse()

  if (!activeCourse || activeCourse.isCompleted) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <div className="flex h-fit bg-gray-gradient border-[#25252A] flex-col lg:flex-row justify-between items-center rounded-[20px] border border-[#25252A] p-4 sm:p-6 gap-6 relative overflow-hidden">
          <div className="flex flex-col items-center lg:items-start w-full lg:w-auto text-center lg:text-left z-10 relative">
            <div className="mb-4">
              <span className="bg-transparent text-[#737373] border border-[#737373] text-[10px] sm:text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider bg-surface-2/50 backdrop-blur-sm">
                Sem Formação Ativa
              </span>
            </div>

            <div className="flex flex-row items-center justify-center lg:justify-start gap-3 mb-2">
              <span className="bg-blue-gradient-500 bg-clip-text text-transparent font-bold text-xl">
                Nenhuma trilha em andamento
              </span>
            </div>

            <p className="text-[#737373] text-[13px] sm:text-sm max-w-[400px]">
              Você ainda não começou nenhum curso. Explore nosso catálogo e dê o próximo passo na sua jornada.
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col items-center gap-4 z-10 relative">
            <div className="flex justify-center items-center">
              <Link href="/learn/catalog" className="relative block w-full">
                <ShineBorder
                  borderWidth={2}
                  className="text-center min-h-[52px] flex items-center justify-center gap-2 hover:bg-[#25252A] rounded-[16px] bg-[#131315] text-white text-base font-medium capitalize"
                  color={["#22D3EE", "#06B6D4", "#0891B2"]}
                >
                  Começar nova trilha <Plus size={20} className="text-[#22D3EE]" />
                </ShineBorder>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const userProgress = activeCourse
    ? await getUserCourseProgress(activeCourse.slug)
    : null

  // VISUAL PADRÃO (COM CURSO ATIVO)
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-between items-center rounded-[20px] bg-primary border border-[#25252A] p-5 sm:p-6 gap-6">
        <div className="flex flex-col items-center lg:items-start w-full lg:w-auto">
          <div className="px-2 text-gray-500 rounded-full border border-[#25252A] mb-6">
            <p className="text-xs text-muted-foreground">
              Curso ativo
            </p>
          </div>

          <div className="flex flex-row items-center justify-center lg:justify-start gap-3 mb-6">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
              <Image
                src={activeCourse.icon}
                alt={activeCourse.title}
                fill
                className="object-contain"
              />
            </div>
            <h2 className="font-bold lg:text-[28px] text-[24px] sm:text-[28px] leading-tight">
              {activeCourse.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 w-full max-w-[300px] lg:max-w-[280px]">
            <div className="flex-1">
              <Progress
                value={userProgress?.course.progress ?? 0}
                className="w-full min-w-[200px] bg-[#25252A] h-[4px]"
              />
            </div>
            <span className="text-xs sm:text-sm text-[#737373] font-medium min-w-[35px]">
              {Math.round(userProgress?.course.progress ?? 0)}%
            </span>
            <Trophy size={24} className="text-[#25252A]" weight="fill" />
          </div>

          <div className="hidden lg:block mt-6">
            <button
              type="button"
              className="flex items-center h-[42px] gap-2 px-5 py-2 bg-[#18181f] hover:bg-[#2E2E32] text-white text-sm rounded-full transition-all active:scale-95"
            >
              <BarbellIcon size={20} className="text-[#FF6200]" weight="fill" />
              Pratique
            </button>
          </div>
        </div>

        <div className="w-full lg:w-auto flex flex-col items-center gap-4">
          <div className="w-full sm:w-[280px] lg:w-[220px]">
            <ContinueCourseButton
              courseId={activeCourse.id}
              courseSlug={activeCourse.slug}
            />
          </div>

          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-full sm:w-[280px] h-[42px] gap-2 px-5 py-2 text-white text-sm rounded-full border border-[#25252A]"
          >
            <BarbellIcon size={18} className="text-[#FF6200]" weight="fill" />
            Pratique
          </button>
        </div>
      </div>

      {/* <div className="pt-4 px-2">
        <p className="text-[#737373] text-[11px] sm:text-xs text-center lg:text-left leading-relaxed">
          Parte da jornada front-end{' '}
          <Link
            href="/learn"
            className="text-[#00C8FF] hover:underline font-medium inline-block"
          >
            Veja a nossa Trilha de Aprendizado
          </Link>
        </p>
      </div> */}
    </div>
  )
}