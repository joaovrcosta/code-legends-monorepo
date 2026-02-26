'use client'

import Image from 'next/image'

interface LoadingProps {
  className?: string
  width?: number
  height?: number
}

export function Loading({ className = '', width = 40, height }: LoadingProps) {
  const h = height ?? Math.round((width / 304) * 573)

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div
        className="absolute bg-blue-500/40 blur-xl rounded-full animate-pulse"
        style={{ width: width * 1.2, height: h * 1.2 }}
      />
      <Image
        src="/loading-logo.svg"
        alt="Carregando..."
        width={width}
        height={h}
        className="relative z-10 animate-pulse"
        priority
      />
    </div>
  )
}
