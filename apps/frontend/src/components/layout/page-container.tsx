import { cn } from '@/lib/utils'

export const PAGE_MAX_WIDTH_CLASS = 'max-w-[1420px]'

export const pageContentWidthClassName = cn(
  'mx-auto w-full min-w-0 px-4 xl:px-0',
  PAGE_MAX_WIDTH_CLASS,
)

/** Rotas com hero full-bleed que controlam a largura internamente. */
const PATHS_WITHOUT_PAGE_CONTAINER = [
  /^\/learn\/tracking$/,
  /^\/learn\/careers\/[^/]+$/,
  /^\/learn\/paths\/[^/]+$/,
]

export function shouldApplyPageContainer(pathname: string): boolean {
  return !PATHS_WITHOUT_PAGE_CONTAINER.some((pattern) => pattern.test(pathname))
}

type PageContainerProps = {
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

export function PageContainer({
  children,
  className,
  innerClassName,
}: PageContainerProps) {
  return (
    <div className={cn('w-full pt-12 px-4 xl:px-0', className)}>
      <div
        className={cn(
          'mx-auto w-full min-w-0 pb-10',
          PAGE_MAX_WIDTH_CLASS,
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}

type PageContentWidthProps = {
  children: React.ReactNode
  className?: string
}

export function PageContentWidth({ children, className }: PageContentWidthProps) {
  return <div className={cn(pageContentWidthClassName, className)}>{children}</div>
}
