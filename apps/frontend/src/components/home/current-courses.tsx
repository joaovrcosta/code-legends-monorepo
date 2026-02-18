import { getUserEnrolledList } from "@/actions/progress";
import { KeepLearningCard } from "./keep-learning-card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";

export async function CurrentCourses() {
    const { userCourses } = await getUserEnrolledList();

    // Filtra apenas cursos com progresso > 0
    const coursesWithProgress = userCourses.filter(
        (course) => course.progress > 0
    );

    if (coursesWithProgress.length === 0) return null;

    const glowColors: Array<"blue" | "purple" | "orange" | "green"> = ["blue", "purple"];

    return (
        <div className="flex flex-col gap-4 w-full relative">
            <h2 className="text-muted-foreground text-sm font-semibold mb-2 mt-8">
                Continuar aprendendo
            </h2>

            <div className="pointer-events-none absolute right-0 top-10 h-[calc(100%-40px)] w-20 bg-gradient-to-l from-[#121214] via-[#121214]/80 to-transparent z-10" />

            <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {coursesWithProgress.map((course, index) => (
                        <CarouselItem
                            key={course.id}
                            className="pl-4 basis-[256px] md:basis-[316px]"
                        >
                            <div className="h-full w-full">
                                <KeepLearningCard
                                    course={course}
                                    glowColor={glowColors[index % glowColors.length] || "blue"}
                                    progress={course.progress}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}