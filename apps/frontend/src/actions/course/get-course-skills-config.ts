"use server";

export type CourseSkillConfigItem = {
  skillId: string;
  name: string;
  slug: string;
  weight: number;
};

export async function getCourseSkillsConfig(
  courseId: string
): Promise<CourseSkillConfigItem[]> {
  if (!courseId) return [];

  try {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) {
      console.warn(
        "[getCourseSkillsConfig] NEXT_PUBLIC_API_URL não definido",
      );
      return [];
    }

    const response = await fetch(
      `${base}/courses/${courseId}/skills-config`,
      {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[getCourseSkillsConfig]",
          response.status,
          courseId,
          await response.text().catch(() => ""),
        );
      }
      return [];
    }

    const data: { skills?: CourseSkillConfigItem[] } = await response.json();
    return Array.isArray(data.skills) ? data.skills : [];
  } catch {
    return [];
  }
}
