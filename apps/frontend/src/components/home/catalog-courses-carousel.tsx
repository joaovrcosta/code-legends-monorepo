'use client'

import { CarouselSection } from '@/components/home/carousel-section'
import type { CourseWithCount } from '@/types/user-course.ts'

export type CatalogCoursesCarouselProps = {
    courses: CourseWithCount[]
}

export function CatalogCoursesCarousel({ courses }: CatalogCoursesCarouselProps) {
    return <CarouselSection courses={courses} />
}
