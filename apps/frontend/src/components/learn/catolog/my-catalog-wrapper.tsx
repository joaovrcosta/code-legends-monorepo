"use client";

import { MyCatalogCarousel } from "./my-catalog-carousel";
import { useEnrolledCoursesStore } from "@/stores/enrolled-courses-store";
import { useEffect } from "react";
import type { EnrolledCourse } from "@/types/user-course.ts";

export function MyCatalogWrapper({
  initialUserCourses,
}: {
  initialUserCourses: EnrolledCourse[];
}) {
  const userCourses = useEnrolledCoursesStore((state) => state.userCourses);
  const initializeCourses = useEnrolledCoursesStore(
    (state) => state.initializeCourses
  );

  useEffect(() => {
    if (initialUserCourses.length > 0) {
      initializeCourses(initialUserCourses);
    }
  }, [initialUserCourses, initializeCourses]);

  return <MyCatalogCarousel userCourses={userCourses} />;
}
