import { Card } from "@/components/ui/card";
import reactIcon from "../../../../public/react-course-icon.svg";
import patternsIcon from "../../../../public/patterns-course-icon.svg";
import tailwindIcon from "../../../../public/tailwind-course-icon.svg";
import Image from "next/image";

export function CategoriesCarousel() {
  return (
    <div className="flex gap-3">
      <Card>
        <Image src={reactIcon} alt="" />
      </Card>
      <Card>
        <Image src={patternsIcon} alt="" />
      </Card>
      <Card>
        <Image src={tailwindIcon} alt="" />
      </Card>
    </div>
  );
}
