import { listForumQuestions } from "@/actions/forum/list-questions";
import { getUserEnrolledList } from "@/actions/progress/get-user-enrolled-list";
import { ForumPageContent } from "@/components/learn/forum/forum-page-content";

export default async function ForumPage() {
  const [questions, enrolled] = await Promise.all([
    listForumQuestions(),
    getUserEnrolledList(),
  ]);

  const courses = (enrolled.userCourses ?? []).map((uc) => ({
    id: uc.course.id,
    title: uc.course.title,
  }));

  return (
    <ForumPageContent initialQuestions={questions} courses={courses} />
  );
}
