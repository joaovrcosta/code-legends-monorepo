import type { Metadata } from 'next'
import { MyCourses } from '@/components/account/my-courses'
import { MySubscriptions } from '@/components/account/my-subscriptions'
import { MyAccess } from '@/components/account/my-access'

export const metadata: Metadata = {
  title: 'Minha Conta - Code Legends',
  description:
    'Gerencie sua conta, cursos, certificados e configurações pessoais.',
}

export const dynamic = 'force-dynamic'

export default function AccountPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <MySubscriptions />
      <MyCourses />
      <MyAccess />
    </div>
  )
}
