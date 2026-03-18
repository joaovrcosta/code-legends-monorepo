'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function LoginPageContent() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const messageParam = searchParams.get('message')
  const displayError =
    messageParam ??
    (errorParam === 'access_denied'
      ? 'Acesso negado. Apenas administradores e instrutores podem acessar o Content Hub.'
      : '')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0c0c0d]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Code Legends</CardTitle>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            Content Hub - Login
          </p>
        </CardHeader>
        <CardContent>
          <form action="/auth/login" method="POST" className="space-y-4">
            {displayError && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                {displayError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0c0c0d]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="h-8 w-32 animate-pulse rounded bg-muted mx-auto" />
            <div className="h-4 w-48 animate-pulse rounded bg-muted mx-auto mt-2" />
          </CardHeader>
          <CardContent>
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted mt-4" />
            <div className="h-10 w-full animate-pulse rounded bg-muted mt-4" />
          </CardContent>
        </Card>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
