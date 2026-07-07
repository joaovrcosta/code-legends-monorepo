import { Card, CardContent } from '../ui/card'
import Link from 'next/link'
import { getCompletedCourses } from '@/actions/course/completed'
import Image from 'next/image'
import { GenerateCertificateButton } from './generate-certificate-button'
import { AccountCardHeader } from './account-card-header'

export async function MyCourses() {
  const completedCourses = await getCompletedCourses()

  const completedCoursesList = completedCourses.courses || []

  return (
    <Card className="rounded-[20px] border-[#25252a] bg-primary p-0">
      <AccountCardHeader
        title="Meus certificados"
        manageHref="/account/certificates"
      />

      <CardContent className="px-6 pb-6 pt-0">
        {completedCoursesList.length > 0 ? (
          <div className="-mx-6">
            {completedCoursesList.map((course, index) => (
              <div
                key={course.id}
                className={
                  index < completedCoursesList.length - 1
                    ? 'border-b border-[#25252A]'
                    : ''
                }
              >
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Image
                      src={course.icon}
                      alt={course.title}
                      width={40}
                      height={40}
                      className="shrink-0 rounded-full"
                    />
                    <h3 className="truncate font-medium text-white">
                      {course.title}
                    </h3>
                  </div>

                  <GenerateCertificateButton
                    courseId={course.id}
                    course={course}
                    variant="link"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Você ainda não completou nenhum curso.{' '}
            <Link
              href="/learn/catalog"
              className="text-[#00c8ff] hover:underline"
            >
              Explorar cursos
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
