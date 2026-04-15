'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Headset, LogOut, User } from 'lucide-react'
import { logout } from '@/actions/auth'
import { getUserFromAPI } from '@/actions/user/get-user-from-api'
import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import freeIconPlan from '../../public/free-plan-icon.svg'
import premiumIconPlan from '../../public/premium-plan-icon.svg'
import proIconPlan from '../../public/pro-plan-icon.svg'

type UserPlan = 'FREE' | 'PRO' | 'PREMIUM'

function normalizePlan(plan: string | undefined): UserPlan {
  if (plan === 'PRO' || plan === 'PREMIUM') return plan
  return 'FREE'
}

export function UserDropdown() {
  const { data: session } = useSession()
  const user = session?.user
  const sessionPlan = normalizePlan(
    (user as { plan?: string } | undefined)?.plan
  )
  /** Plano vindo de GET /me — mesma fonte do UserProfiler (JWT da sessão atrasa após upgrade). */
  const [planFromApi, setPlanFromApi] = useState<UserPlan | null>(null)
  const userPlan = planFromApi ?? sessionPlan
  const [open, setOpen] = useState(false)

  const refreshPlanFromApi = useCallback(() => {
    if (!session?.user) {
      setPlanFromApi(null)
      return
    }
    void getUserFromAPI().then((u) => {
      if (u) setPlanFromApi(normalizePlan(u.plan))
    })
  }, [session?.user])

  useEffect(() => {
    refreshPlanFromApi()
  }, [refreshPlanFromApi])

  useEffect(() => {
    if (open) refreshPlanFromApi()
  }, [open, refreshPlanFromApi])

  // Obtém as iniciais do nome para o fallback
  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return name[0].toUpperCase()
  }

  useEffect(() => {
    let timeoutRef: NodeJS.Timeout | null = null

    const handleResize = () => {
      // Fecha o dropdown imediatamente ao detectar resize
      if (open) {
        setOpen(false)
      }
    }

    const debouncedHandleResize = () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef)
      }
      timeoutRef = setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', debouncedHandleResize)

    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
      if (timeoutRef) {
        clearTimeout(timeoutRef)
      }
    }
  }, [open])

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div className="hover:bg-[#25252A] p-1 rounded-full cursor-pointer">
            <Avatar className="h-[38px] w-[38px]">
              <AvatarImage src={user?.image || undefined} />
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          className="
                   w-screen 
                   max-w-none 
                   left-0 
                   right-0 
                   rounded-none 
                   border-none 
                   bg-surface-2 
                   shadow-2xl 
                   z-50
                   mt-1
               
                   sm:w-auto 
                   sm:max-w-sm 
                   sm:rounded-[20px] 
                   sm:border 
                   sm:border-[#25252A] 
                   sm:left-auto 
                   sm:right-auto
                 "
        >
          <DropdownMenuLabel className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-[38px] w-[38px]">
                  <AvatarImage src={user?.image || undefined} />
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white text-sm">{user?.name}</p>
                  <p className="text-[#708089] text-xs">{user?.email}</p>
                </div>
              </div>
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
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="border border-[#25252A]" />
          <DropdownMenuItem
            asChild
            className="px-6 py-4 lg:w-[352px] w-full text-white border-none rounded-[20px]"
          >
            <Link href="/account" className="flex items-center space-x-2">
              <User className="text-[#00C8FF]" />
              <span>Minha conta</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="px-6 py-4  lg:w-[352px] w-full text-white border-none rounded-[20px]"
          >
            <Link href="/account" className="flex items-center space-x-2">
              <Headset className="text-[#00C8FF]" />
              <span>Suporte</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="px-6 py-4  lg:w-[352px] w-full text-white border-none rounded-[20px] cursor-pointer"
            onClick={() => logout()}
          >
            <div className="flex items-center space-x-2">
              <LogOut className="text-[#fe6e78]" />
              <span className="text-[#fe6e78]">Sair da conta</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
