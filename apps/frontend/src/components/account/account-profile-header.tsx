import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarRingVariant,
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { User } from '@/types/user'

function planToRingVariant(plan?: string): AvatarRingVariant {
  if (plan === 'PRO') return 'pro'
  if (plan === 'PREMIUM') return 'premium'
  return 'free'
}

function formatCareerLabel(career: string): string {
  return career
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

interface AccountProfileHeaderProps {
  user: User
}

export function AccountProfileHeader({ user }: AccountProfileHeaderProps) {
  const careerLabel = user.onboardingCareer
    ? formatCareerLabel(user.onboardingCareer)
    : user.expertise?.[0] ?? null

  return (
    <div className="flex w-full flex-col items-center gap-3 text-center">
      <Avatar
        className="h-32 w-32"
        ringVariant={planToRingVariant(user.plan)}
      >
        <AvatarImage src={user.avatar || ''} />
        <AvatarFallback className="text-xl">
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-white">{user.name}</h1>
        <p className="text-sm text-muted">{user.email}</p>
        <p className="text-sm text-muted">
          Membro desde{' '}
          {new Date(user.createdAt).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {careerLabel && (
        <Badge
          variant="outline"
          className="rounded-full border-[#25252A] px-4 py-1 text-sm font-normal text-[#C4C4CC]"
        >
          {careerLabel}
        </Badge>
      )}
    </div>
  )
}
