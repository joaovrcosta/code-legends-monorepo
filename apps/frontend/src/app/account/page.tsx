import { MyCourses } from '@/components/account/my-courses'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarRingVariant,
} from '@/components/ui/avatar'
import { getCurrentUser } from '@/actions/user/get-current-user'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { MySubscriptions } from '@/components/account/my-subscriptions'
import { MyAccess } from '@/components/account/my-access'

function planToRingVariant(plan?: string): AvatarRingVariant {
  if (plan === 'PRO') return 'pro'
  if (plan === 'PREMIUM') return 'premium'
  return 'free'
}

export const metadata: Metadata = {
  title: 'Minha Conta - Code Legends',
  description:
    'Gerencie sua conta, cursos, certificados e configurações pessoais.',
}

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }
  return (
    <div className="space-y-4 w-full mt-8">
      <div className="lg:flex hidden items-center space-x-2 px-4 py-8 mt-8">
        <Avatar
          className="h-[52px] w-[52px]"
          ringVariant={planToRingVariant(user.plan)}
        >
          <AvatarImage src={user.avatar || ''} />
          <AvatarFallback>
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="text-xs text-zink-500">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            Membro desde{' '}
            {new Date(user.createdAt).toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
      </div>
      <MyCourses />

      <MySubscriptions />

      <MyAccess />
    </div>
  )
}
