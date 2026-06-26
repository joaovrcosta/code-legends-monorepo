import { getUserEnrolledList } from "@/actions/progress";
import { KeepLearningCard } from "./keep-learning-card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";

export async function CurrentCourses() {
    const { userCourses } = await getUserEnrolledList();

    const coursesWithProgress = userCourses.filter(
        (course) => course.progress > 0 && !course.isCompleted
    );

    if (coursesWithProgress.length === 0) return null;

    const glowColors: Array<"blue" | "purple" | "orange" | "green"> = ["blue", "purple"];
    const isSingle = coursesWithProgress.length === 1;
    const single = isSingle ? coursesWithProgress[0] : undefined;

    return (
        <div className="flex flex-col gap-4 w-full relative">

            {!isSingle && (
                <div className="pointer-events-none absolute right-0 top-10 h-[calc(100%-40px)] w-20 bg-gradient-to-l from-surface via-surface/80 to-transparent z-10" />
            )}

            {isSingle && single ? (
                <>
                    <div className="md:hidden w-full min-w-0 max-w-full">
                        <KeepLearningCard
                            course={single}
                            glowColor={glowColors[0] ?? "blue"}
                            progress={single.progress}
                        />
                    </div>
                    <div className="hidden md:block w-full">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: false,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4">
                                <CarouselItem className="pl-4 basis-[316px]">
                                    <div className="h-full w-full min-w-0">
                                        <KeepLearningCard
                                            course={single}
                                            glowColor={glowColors[0] ?? "blue"}
                                            progress={single.progress}
                                        />
                                    </div>
                                </CarouselItem>
                            </CarouselContent>
                        </Carousel>
                    </div>
                </>
            ) : (
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
                                <div className="h-full w-full min-w-0">
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
            )}
        </div>
    );
}
