'use client'

import { CarouselSection } from '@/components/home/carousel-section'
import type { CourseWithCount } from '@/types/user-course.ts'

export type CatalogCoursesCarouselProps = {
    courses: CourseWithCount[]
    sectionTitle?: string
}

export function CatalogCoursesCarousel({
    courses,
    sectionTitle,
}: CatalogCoursesCarouselProps) {
    return <CarouselSection courses={courses} sectionTitle={sectionTitle} />
}
