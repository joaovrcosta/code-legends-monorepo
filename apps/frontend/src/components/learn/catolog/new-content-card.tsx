import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Play, Plus } from 'lucide-react'
import Image from 'next/image'
import backgroundBanner from '../../../../public/background-banner.png'

export function NewContentCard() {
  return (
    <div className="relative flex h-[400px] w-full min-w-0 overflow-hidden rounded-[16px] border border-[#25252A] shadow-lg">
      <Image
        src={backgroundBanner}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="(max-width: 1024px) 85vw, 90vw"
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#0c0c0d_0%,#0c0c0d_24%,rgba(12,12,13,0.92)_30%,rgba(12,12,13,0.55)_36%,transparent_45%)]" />

      <div className="relative z-10 flex h-full flex-1 flex-col justify-between px-5 py-6 lg:px-8 lg:py-8">
        <div>
          <h3 className="text-[24px] font-semibold text-white lg:text-[24px]">
            Code Genesis
          </h3>
          <p className="mt-2 max-w-[480px] text-base leading-relaxed text-[#a1a1aa] line-clamp-2 lg:line-clamp-none">
            Aprenda a programar do zero, partindo dos princípios da web até
            criação de aplicações frontend e backend.
          </p>

          <div className="mt-8 flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://avatars.githubusercontent.com/u/70654718?s=400&u=415dc8fde593b5dcbdef181e6186a8d80daf72fc&v=4" />
              <AvatarFallback>JV</AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium text-white">João Victor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button className="h-[52px] w-48 rounded-full border border-[#25252A] bg-[#e8e8ed] px-5 text-base font-semibold text-[#0c0c0d] hover:bg-white">
            <Play className="mr-2 h-4 w-4 fill-current" />
            Acessar
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-[52px] w-[52px] shrink-0 rounded-full border-[#25252A] bg-[#1a1a1e] text-white hover:bg-[#25252A]"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
