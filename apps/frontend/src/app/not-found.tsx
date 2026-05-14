import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-63px)] w-full flex-col items-center justify-center bg-surface px-4 py-16">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Erro 404
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">
          Página não encontrada
        </h1>
        <p className="mt-4 text-muted-foreground">
          O endereço não existe ou não está mais disponível. Verifique o link ou
          volte ao início.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="default" className="rounded-full h-[44px] ">
            <Link href="/">Início</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full bg-blue-gradient-500 border-none h-[44px]">
            <Link href="/learn/catalog">Descobrir novos cursos</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
