export function classroomPageTitle(courseTitle?: string | null): string {
  const name = courseTitle?.trim()
  return name ? `Trilha | ${name} | Code Legends` : 'Trilha | Code Legends'
}
