import { AccountAsideMenu } from "@/components/account/aside-menu";
import { FooterFixed } from "@/components/learn/footer-fixed";
import LearnHeader from "@/components/learn/header";
import { getActiveCourse } from "@/actions/user/get-active-course";
import { getUserEnrolledList } from "@/actions/progress";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Busca os dados no servidor
  const [enrolledCoursesData, activeCourse] = await Promise.all([
    getUserEnrolledList(),
    getActiveCourse(),
  ]);

  return (
    <>
      <LearnHeader
        initialUserCourses={enrolledCoursesData.userCourses || []}
        initialActiveCourse={activeCourse}
      />

      <div className="max-w-[1560px] mx-auto flex lg:mt-[78px] mt-[63px] lg:gap-10 gap-4 lg:flex-row flex-col items-start px-4 pb-20">
        <AccountAsideMenu />
        <main className="w-full lg:flex-1 min-w-0">{children}</main>
      </div>
      <FooterFixed />
    </>
  );
}
