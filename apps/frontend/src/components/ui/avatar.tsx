'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

import { cn } from '@/lib/utils'

const RING_GRADIENT_BY_VARIANT: Record<
  'free' | 'pro' | 'premium' | 'gradient',
  React.CSSProperties
> = {
  free: {
    background:
      '#25252a',
  },
  pro: {
    background:
      'linear-gradient(135deg, #8234E9 0%, #9B4DE0 50%, #A855F7 100%)',
  },
  premium: {
    background:
      'linear-gradient(135deg, #FF6200 0%, #FF8533 50%, #E55A00 100%)',
  },
  gradient: {
    background:
      'linear-gradient(135deg, #00D9FF 0%, #00C8FF 25%, #7B61FF 50%, #A855F7 75%, #00D9FF 100%)',
  },
}

export type AvatarRingVariant = keyof typeof RING_GRADIENT_BY_VARIANT

export interface AvatarProps extends React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Root
> {
  ringVariant?: AvatarRingVariant
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, ringVariant, ...props }, ref) => {
  if (ringVariant) {
    return (
      <div
        className="rounded-full p-[2px] flex-shrink-0 w-fit"
        style={RING_GRADIENT_BY_VARIANT[ringVariant]}
      >
        <div className="bg-surface-2 rounded-full p-[6px]">
          <AvatarPrimitive.Root
            ref={ref}
            className={cn(
              'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
              className,
            )}
            {...props}
          />
        </div>
      </div>
    )
  }

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className,
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
