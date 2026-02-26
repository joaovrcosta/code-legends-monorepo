import React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animate?: 'pulse' | 'none'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animate = 'pulse',
  className = '',
  style,
  ...props
}) => {
  const baseStyles = 'bg-zinc-900 dark:bg-zinc-900'

  const animationStyles = animate === 'pulse' ? 'animate-pulse' : ''

  const variantStyles = {
    text: 'h-4 w-full rounded-md mt-1 mb-1',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const combinedClasses =
    `${baseStyles} ${animationStyles} ${variantStyles[variant]} ${className}`.trim()

  return (
    <div
      className={combinedClasses}
      style={{ width, height, ...style }}
      {...props}
    />
  )
}
