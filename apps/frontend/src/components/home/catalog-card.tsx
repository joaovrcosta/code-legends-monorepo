'use client'

import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  ChartNoAxesColumnIncreasing,
  ScrollText,
} from 'lucide-react'
import { Check, Plus, Star } from '@phosphor-icons/react/dist/ssr'
import { enrollInCourse } from '@/actions/course'
import { useState } from 'react'
import { useEnrolledCoursesStore } from '@/stores/enrolled-courses-store'
import coverBackground from '../../../public/cover-background.png'

// Componente para o botão de enroll
function EnrollButton({
  courseId,
  onEnrollSuccess,
}: {
  courseId?: string
  onEnrollSuccess?: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const userCourses = useEnrolledCoursesStore((state) => state.userCourses)
  const refreshEnrolledCourses = useEnrolledCoursesStore(
    (state) => state.refreshEnrolledCourses,
  )

  // Verifica se o curso está inscrito usando o store
  const isEnrolled = courseId
    ? userCourses.some((course) => course.courseId === courseId)
    : false

  const handleEnroll = async () => {
    if (!courseId || isLoading || isEnrolled) return

    try {
      setIsLoading(true)
      await enrollInCourse(courseId)
      onEnrollSuccess?.()

      // Atualiza apenas a lista de cursos inscritos sem recarregar toda a página
      await refreshEnrolledCourses()
    } catch (error) {
      console.error('Erro ao inscrever:', error)
      alert(
        error instanceof Error ? error.message : 'Erro ao inscrever no curso',
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Se já está inscrito, mostra o check
  if (isEnrolled) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:text-[#35BED5]">
        <Check size={20} className="text-green-500 hover:text-[#35BED5]" />
      </div>
    )
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={!courseId || isLoading}
      className="bg-gray-gradient-first rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center justify-center w-8 h-8 hover:bg-[#25252A] rounded-full cursor-pointer hover:text-[#35BED5]">
        <Plus size={28} className="text-white hover:text-[#35BED5]" />
      </div>
    </button>
  )
}

function getStatusInfo(status?: RecomendationCardProps['status']) {
  switch (status) {
    case 'in-progress':
      return {
        label: 'Em progresso...',
        className: 'text-[#007e97]',
        icon: (isFavorite?: boolean) => (
          <Star
            size={20}
            weight="fill"
            className={isFavorite ? 'text-[#35BED5]' : 'text-gray-600'}
          />
        ),
      }
    case 'completed':
      return {
        label: 'Concluído',
        className: 'text-green-600',
        icon: (isFavorite?: boolean) => (
          <Star
            size={20}
            weight="fill"
            className={isFavorite ? 'text-[#35BED5]' : 'text-gray-600'}
          />
        ),
      }
    case 'career':
    case 'continue':
      return {
        label: 'Curso atual',
        className: 'text-white',
        icon: (isFavorite?: boolean) => (
          <Star
            size={20}
            weight="fill"
            className={isFavorite ? 'text-[#35BED5]' : 'text-gray-600'}
          />
        ),
      }
    case 'not-started':
    default:
      return {
        label: 'Curso',
        className: 'text-gray-500',
        icon: (isFavorite?: boolean) => (
          <Star
            size={20}
            weight="fill"
            className={isFavorite ? 'text-[#35BED5]' : 'text-gray-600'}
          />
        ),
      }
  }
}

function getAudienceLabelFromLevel(level?: string): string {
  const normalized = (level ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (normalized === 'beginner' || normalized === 'iniciante')
    return 'Iniciantes'
  if (normalized === 'intermediate' || normalized === 'intermediario')
    return 'Intermediários'
  if (normalized === 'advanced' || normalized === 'avancado') return 'Avançados'

  return 'Avançados'
}

function getAccentClassFromLevel(level?: string): string {
  const normalized = (level ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (normalized === 'beginner' || normalized === 'iniciante')
    return 'text-green-500'
  if (normalized === 'intermediate' || normalized === 'intermediario')
    return 'text-orange-500'
  if (normalized === 'advanced' || normalized === 'avancado')
    return 'text-violet-700'

  return 'text-green-500'
}

interface RecomendationCardProps {
  name: string
  icon: string | StaticImageData
  thumbnail?: string | StaticImageData
  url: string
  color: string
  className?: string
  isCurrent?: boolean
  isFavorite?: boolean
  status?: 'in-progress' | 'completed' | 'not-started' | 'career' | 'continue'
  tags?: string[]
  courseId?: string
  onEnrollSuccess?: () => void
  level?: string
  isFree?: boolean
  position?: 'first' | 'middle' | 'last'
}

export function CatalogCard({
  name,
  icon,
  url,
  status,
  className,
  isCurrent,
  courseId,
  onEnrollSuccess,
  level,
  isFree,
  position = 'middle',
}: RecomendationCardProps) {
  const router = useRouter()

  const { label, className: statusClass } = getStatusInfo(status)

  const transformOriginClass =
    position === 'first'
      ? 'origin-left'
      : position === 'last'
        ? 'origin-right'
        : 'origin-center'

  return (
    <Link href={url} className="block h-full group">
      <div
        className={`relative z-0 overflow-hidden w-full h-full min-w-[300px] flex flex-col rounded-[16px] border shadow-2xl cursor-pointer
    transition-transform transition-shadow transition-border duration-300 ease-out
    hover:z-20 hover:-translate-y-3 hover:scale-[1.08] hover:border-[#3f3f48]
    hover:shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06),inset_0_-24px_24px_rgba(255,255,255,0.03)]
    ${
      isCurrent
        ? 'bg-blue-gradient-second border-[#35BED5]'
        : 'bg-gray-gradient border-[#25252A]'
    }
    ${transformOriginClass}
    ${className}`}
      >
        {/* IMAGEM DE FUNDO CORRIGIDA */}
        <Image
          src={coverBackground}
          alt="Background do Card"
          fill
          priority
          // Removido o -z-10 e adicionado pointer-events-none.
          // Ajuste a opacity-30 para mais ou para menos conforme o seu gosto visual.
          className="object-cover absolute inset-0 opacity-30 pointer-events-none"
        />

        {/* Adicionado relative z-10 para o conteúdo ficar acima da imagem */}
        {label && (
          <div className="relative z-10 flex items-center justify-between rounded-t-[20px] pr-4 pl-4 pt-4 pb-0">
            <div
              className={`text-white ${statusClass} rounded-full px-2 border ${
                isCurrent ? 'border-white' : 'border-[#25252A]'
              }`}
            >
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            {isFree ? (
              <div className="bg-lime-500/10 border border-lime-500/20 rounded-full px-2 py-1">
                <p className="text-xs text-lime-400 font-semibold">Gratuito</p>
              </div>
            ) : (
              <div className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-orange-400/20 text-purple-400 border border-purple-500/20">
                Para assinantes
              </div>
            )}
          </div>
        )}

        {/* Adicionado relative z-10 */}
        <div className="relative z-10 flex flex-col flex-1 p-4">
          <Image src={icon} alt={name} width={80} height={80} />
          <div className="px-4 pt-2">
            <div className="flex items-center space-x-1">
              <span
                className={`font-semibold bg-clip-text text-base text-white line-clamp-2`}
              >
                {name}
              </span>
              <ArrowUpRight className="flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Adicionado relative z-10 */}
        <div className="relative z-10 mt-2 flex items-center justify-between px-4 pb-4">
          <div className="flex items-center gap-2 text-xs text-white">
            <ChartNoAxesColumnIncreasing
              size={16}
              className={getAccentClassFromLevel(level)}
            />
            <p className="text-muted-foreground">
              Para {getAudienceLabelFromLevel(level)}
            </p>
          </div>

          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(url)
              }}
              className="flex items-center justify-center w-8 h-8 hover:bg-[#25252A] rounded-full cursor-pointer hover:text-[#35BED5]"
            >
              <ScrollText size={20} className="text-gray-600" />
            </button>

            <div onClick={(e) => e.stopPropagation()}>
              <EnrollButton
                courseId={courseId}
                onEnrollSuccess={onEnrollSuccess}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
