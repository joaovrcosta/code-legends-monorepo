import Link from 'next/link'
import { Progress } from '../ui/progress'
import { ActivityCalendar } from './activity-calendar'
import { CaretRight, Flame } from '@phosphor-icons/react/dist/ssr'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarRingVariant,
} from '../ui/avatar'
import { getCurrentUser } from '@/actions/user/get-current-user'
import { getUserFromAPI } from '@/actions/user/get-user-from-api'
import { CtaFacaUpgradeCard } from '@/components/cta'
import freeIconPlan from '../../../public/free-plan-icon.svg'
import premiumIconPlan from '../../../public/premium-plan-icon.svg'
import proIconPlan from '../../../public/pro-plan-icon.svg'
import Image from 'next/image'

export async function UserProfiler() {
  const user = await getCurrentUser()
  const userFromAPI = await getUserFromAPI()
  const firstName = user?.name?.split(' ')[0] || 'Usuário'

  const level = userFromAPI?.level ?? user?.level ?? 1
  const _totalXp = userFromAPI?.totalXp ?? user?.totalXp ?? 0
  const xpToNextLevel = userFromAPI?.xpToNextLevel ?? user?.xpToNextLevel ?? 100

  // Calcula o XP necessário apenas para o próximo nível
  const calculateXpRequiredForNextLevel = (lvl: number): number => {
    return 100 + (lvl - 1) * 50
  }

  // XP necessário para passar do nível atual para o próximo
  const xpNeededForNextLevel = calculateXpRequiredForNextLevel(level)
  // XP atual no nível = XP necessário - XP que falta
  const currentLevelXp = xpNeededForNextLevel - xpToNextLevel
  // Progresso: quanto XP já tem no nível atual / quanto precisa para o próximo nível
  const progress =
    xpNeededForNextLevel > 0
      ? Math.max(
          0,
          Math.min(100, (currentLevelXp / xpNeededForNextLevel) * 100),
        )
      : 0

  const userPlan = userFromAPI?.plan ?? user?.plan

  const avatarRingVariant: AvatarRingVariant =
    userPlan === 'PRO' ? 'pro' : userPlan === 'PREMIUM' ? 'premium' : 'free'

  return (
    <div className="w-full lg:mb-0 mb-6 lg:max-w-[360px] flex-shrink-0 self-stretch lg:mt-9 mt-0 flex flex-col gap-8 lg:sticky lg:top-[32px] h-fit">
      <div className="bg-[#1A1A1E] p-6 border border-[#25252A] rounded-[20px] w-full">
        <div className=" flex justify-between">
          <h1 className="text-white text-xl font-medium">Olá, {firstName}</h1>
          {userPlan === 'PREMIUM' ? (
            <div className="flex items-center gap-2">
              <Image
                src={premiumIconPlan}
                alt="PREMIUM"
                width={16}
                height={16}
              />
              <span className="text-[#FF6200] font-medium">PREMIUM</span>
            </div>
          ) : userPlan === 'PRO' ? (
            <div className="flex items-center gap-2">
              <Image src={proIconPlan} alt="PRO" width={16} height={16} />
              <span className="text-[#8234E9] font-medium">PRO</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Image src={freeIconPlan} alt="FREE" width={16} height={16} />
              <span className="text-[#B8E62E] font-medium">FREE</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 mt-6">
          {/* Avatar com anel na cor do plano */}
          <Avatar ringVariant={avatarRingVariant} className="h-16 w-16">
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="bg-[#25252A] text-white text-lg font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Botão Meu perfil */}
          <Link href="/account" className="flex-1">
            <button className="w-full h-[44px] bg-transparent border border-[#25252a] hover:opacity-90 hover:bg-[#25252a] transition-all rounded-[12px] text-white font-medium text-sm flex items-center justify-center">
              Meu perfil
            </button>
          </Link>
        </div>
        <div className="mt-6">
          <div>
            <p className="text-white text-sm font-medium">Nível {level}</p>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-4 w-full">
              <Progress
                value={progress}
                className="w-full bg-[#25252A] h-[2px]"
              />
              <p className="text-sm text-center text-white">
                {Math.round(progress)}%
              </p>
            </div>
          </div>
          <div className="mt-6 w-full overflow-x-auto scrollbar-hide py-2">
            <div className="min-w-fit flex justify-center">
              <ActivityCalendar />
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/learn/badges"
              className="flex items-center justify-between py-4 border-b border-[#25252A] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span className="text-[#C4C4CC] text-sm font-medium">
                Ver Meus Emblemas
              </span>
              <CaretRight
                size={16}
                className="text-[#C4C4CC]"
                weight="regular"
              />
            </Link>
            <Link
              href="/learn/tracking"
              className="flex items-center justify-between py-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span className="text-[#C4C4CC] text-sm font-medium">
                Ver Meu Progresso
              </span>
              <CaretRight
                size={16}
                className="text-[#C4C4CC]"
                weight="regular"
              />
            </Link>
          </div>
        </div>
      </div>
      {userPlan !== 'PRO' && userPlan !== 'PREMIUM' && <CtaFacaUpgradeCard />}
      <div className="bg-[#1A1A1E] border border-[#25252A] rounded-[20px] w-full p-6">
        <div className="flex items-center gap-2 mb-2">
          <Flame size={24} weight="fill" className="text-[#FF6200]" />
          <span className="text-white text-lg font-semibold">Streak</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">0</span>
          <span className="text-sm text-[#C4C4CC]">dias</span>
        </div>
        <p className="text-xs text-[#737373] mt-2">
          Assista uma aula para aumentar seu streak
        </p>
      </div>
    </div>
  )
}
