"use client";

import { useEnrolledCoursesStore } from "@/stores/enrolled-courses-store";
import { useEffect } from "react";
import type { EnrolledCourse } from "@/types/user-course.ts";

interface HomePageWrapperProps {
    children: React.ReactNode;
    initialUserCourses: EnrolledCourse[];
}

export function HomePageWrapper({
    children,
    initialUserCourses,
}: HomePageWrapperProps) {
    const initializeCourses = useEnrolledCoursesStore(
        (state) => state.initializeCourses
    );

    useEffect(() => {
        if (initialUserCourses.length > 0) {
            initializeCourses(initialUserCourses);
        }
    }, [initialUserCourses, initializeCourses]);

    return <>{children}</>;
}
