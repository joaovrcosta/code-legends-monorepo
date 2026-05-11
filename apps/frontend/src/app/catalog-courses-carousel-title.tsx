import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type CatalogCoursesCarouselTitleProps = {
    title: string
    icon?: ReactNode
    className?: string
}

export function SectionTitle({
    title,
    icon,
    className,
}: CatalogCoursesCarouselTitleProps) {
    return (
        <div className={cn('flex min-w-0 items-center gap-2', className)}>
            {icon ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#25252A] bg-gray-gradient">
                    {icon}
                </div>
            ) : null}
            <span className="text-[#666] text-sm font-semibold">
                {title}
            </span>
        </div>
    )
}
