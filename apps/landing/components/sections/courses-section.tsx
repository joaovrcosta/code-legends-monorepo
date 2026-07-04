import { courses, coursesSection } from "@/content/courses";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { CourseCardItem } from "@/components/ui/course-card";

export function CoursesSection() {
  const titleId = `${coursesSection.id}-title`;

  return (
    <section
      id={coursesSection.id}
      aria-labelledby={titleId}
      className="landing-section"
    >
      <Container className="space-y-10">
        <SectionHeading
          eyebrow={coursesSection.eyebrow}
          title={coursesSection.title}
          description={coursesSection.description}
          titleId={titleId}
        />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <li key={course.id}>
              <CourseCardItem course={course} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
