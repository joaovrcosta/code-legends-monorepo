import { Badge } from '@/components/ui/badge'
import {
  AccountPlanAvatar,
  AccountPlanBadge,
} from '@/components/account/account-plan-visuals'
import type { User } from '@/types/user'

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
      <div className="relative mb-1">
        <AccountPlanAvatar
          avatarSrc={user.avatar}
          avatarFallback={user.name?.charAt(0).toUpperCase() || 'U'}
          fallbackPlan={user.plan}
        />
        <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-[20%]">
          <AccountPlanBadge />
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h1 className="text-xl font-semibold text-white">{user.name}</h1>
        <p className="text-sm text-muted">{user.email}</p>
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
