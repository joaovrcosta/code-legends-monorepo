import { Album } from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/card";
import Link from "next/link";
import { getCompletedCourses } from "@/actions/course/completed";
import Image from "next/image";
import { GenerateCertificateButton } from "./generate-certificate-button";

export async function MyCourses() {
  const completedCourses = await getCompletedCourses();

  const completedCoursesList = completedCourses.courses || [];
  
  return (
    <Card className="bg-[#121214] border-[#25252a] lg:p-10 py-4 px-2">
      <CardHeader className="px-4">
        <div className="flex items-center space-x-2">
          <Album className="w-6 h-6 text-[#00c8ff]" />
          <h1 className="text-lg font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
            Meus certificados
          </h1>
          <Link href="/account/purchases">
            <span className="text-sm text-muted-foreground">Gerenciar</span>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Gerencie seus cursos e progresso.
        </p>
      </CardHeader>

      <CardContent className="px-0 mt-4">
        {completedCoursesList.length > 0 ? (
          <div className="space-y-3">
            {completedCoursesList.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-3 bg-transparent border border-[#333333] rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Image
                    src={course.icon}
                    alt={course.title}
                    width={52}
                    height={52}
                  />
                  <div>
                    <h3 className="text-white font-medium">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Concluído
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <GenerateCertificateButton
                    courseId={course.id}
                    course={course}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              Você ainda não completou nenhum curso.
            </p>
            <Link
              href="/learn/catalog"
              className="text-[#00c8ff] text-sm hover:underline mt-2 inline-block"
            >
              Explorar cursos
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
