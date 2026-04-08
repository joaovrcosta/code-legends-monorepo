'use client'

import { useEffect, useState } from 'react'
import {
  Code,
  Cpu,
  Database,
  Globe,
  Gear,
  Monitor,
} from '@phosphor-icons/react'

function skillIconComponentFor(name: string, slug: string) {
  const n = `${name} ${slug}`.toLowerCase()
  if (
    n.includes('design') ||
    n.includes('ui') ||
    n.includes('ux') ||
    n.includes('figma')
  ) {
    return Monitor
  }
  if (
    n.includes('sql') ||
    n.includes('database') ||
    n.includes('mongo') ||
    n.includes('postgres')
  ) {
    return Database
  }
  if (
    n.includes('devops') ||
    n.includes('docker') ||
    n.includes('aws') ||
    n.includes('cloud')
  ) {
    return Gear
  }
  if (
    n.includes('html') ||
    n.includes('css') ||
    n.includes('web') ||
    n.includes('front')
  ) {
    return Globe
  }
  if (
    n.includes('python') ||
    n.includes('java') ||
    n.includes('csharp') ||
    n.includes('c#') ||
    n.includes('go ') ||
    n.includes('rust') ||
    n.includes('kotlin') ||
    n.includes('backend')
  ) {
    return Cpu
  }
  return Code
}

export type SkillMarkProps = {
  name: string
  slug: string
  imageUrl?: string | null
  size: number
  className?: string
}

/**
 * Ícone heurístico ou imagem opcional cadastrada na skill (URL pública).
 */
export function SkillMark({
  name,
  slug,
  imageUrl,
  size,
  className,
}: SkillMarkProps) {
  const [broken, setBroken] = useState(false)
  const Icon = skillIconComponentFor(name, slug)
  const url = imageUrl?.trim()
  const showImg = Boolean(url) && !broken

  useEffect(() => {
    setBroken(false)
  }, [url])

  if (showImg) {
    return (
      <img
        src={url}
        alt=""
        title={name}
        width={size}
        height={size}
        className={`shrink-0 rounded-md object-cover ring-1 ring-[#25252A] ${className ?? ''}`}
        loading="lazy"
        onError={() => setBroken(true)}
      />
    )
  }

  return (
    <Icon
      className={`shrink-0 text-[#C4C4CC] ${className ?? ''}`}
      size={size}
      weight="regular"
    />
  )
}
