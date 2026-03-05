'use client'

import { useEffect, useState } from 'react'
import { getCourseSkillsProgress } from '@/actions/course'
import type { CourseSkillsProgressResponse } from '@/actions/course/skills-progress'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface SkillProgressPanelProps {
  courseId: string
}

export function SkillProgressPanel({ courseId }: SkillProgressPanelProps) {
  const [data, setData] = useState<CourseSkillsProgressResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!courseId) return
      setIsLoading(true)
      try {
        const progress = await getCourseSkillsProgress(courseId)
        setData(progress)
      } catch (error) {
        console.error('Erro ao carregar progresso de skills do curso:', error)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [courseId])

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Carregando progresso de skills...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!data || data.skills.length === 0) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Progresso por skill neste curso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.skills.map((skill) => (
          <div key={skill.skillId} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {skill.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {skill.totalXp.toLocaleString('pt-BR')} XP total
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#18181b] overflow-hidden">
              <div
                className="h-2 rounded-full bg-[#22d3ee]"
                style={{
                  width: `${Math.min(100, Math.max(5, skill.weight))}%`,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

