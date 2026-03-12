'use client'

import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { LevelBars } from '@/components/course/level-bars'

interface ProjectCardProps {
    title: string
    description: string
    image: string | StaticImageData
    level: string
    url: string
    glowClass?: string
    category: string
}

export function ProjectCard({
    title,
    description,
    image,
    level,
    url,
    glowClass = "bg-gray-gradient",
    category
}: ProjectCardProps) {
    return (
        <Link href={url} className="group flex rounded-[20px] flex-col w-full overflow-hidden bg-gray-gradient border border-white/5 transition-all hover:border-white/20">

            <div className={`relative aspect-[16/10] w-full ${glowClass} flex items-center justify-center p-8 rounded-[20px]`}>
                <div className="relative w-full h-full drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 rounded-[20px]">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-contain rounded-[20px]"
                        priority
                    />
                </div>
            </div>

            <div className="flex flex-col pb-6 pr-6 pl-6 pt-0 gap-4">
                <h3 className="text-2xl font-semibold text-zinc-100 leading-tight">
                    {title}
                </h3>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-300">
                        {description}
                    </span>
                    <span className="bg-[#29292e] text-[10px] font-bold px-3 py-1.5 rounded-full text-zinc-300 uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        {category}
                    </span>
                </div>

                <div className="mt-2 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                        {category}
                    </span>

                    <div className="flex items-center gap-3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c7c8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>
                        <LevelBars level={level} isSmall />
                    </div>
                </div>
            </div>
        </Link>
    )
}