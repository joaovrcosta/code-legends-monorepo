import { Crown } from "lucide-react";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils"; // Função para combinar classes do Tailwind
import Link from "next/link";

const skills = [
  {
    name: "HTML & CSS",
    value: 47,
    nameColor: "orange-gradient-500",
    color: "bg-[#FF4500]",
  },
  {
    name: "Styled Components",
    value: 72,
    nameColor: "purple-gradient-500",
    color: "bg-[#6600E5]",
  },
  {
    name: "ReactJS",
    value: 38,
    nameColor: "blue-gradient-500",
    color: "bg-[#00c8ff]",
  },
  {
    name: "Web Designer",
    value: 84,
    nameColor: "yellow-gradient-500",
    color: "bg-[#FFA600]",
  },
  {
    name: "Patterns",
    value: 0,
    nameColor: "lemon-gradient-500",
    color: "bg-[#BFF21A]",
  },
  {
    name: "Performance",
    value: 0,
    nameColor: "red-gradient-500",
    color: "bg-[#BD1C1C]",
  },
];

const gradientClasses: { [key: string]: string } = {
  "blue-gradient-500":
    "bg-[linear-gradient(267deg,#004e63_0%,#00c8ff_100%)] text-transparent bg-clip-text",
  "orange-gradient-500":
    "bg-[linear-gradient(267deg,#992900_0%,#FF4500_100%)] text-transparent bg-clip-text",
  "red-gradient-500":
    "bg-[linear-gradient(267deg,#570D0D_0%,#BD1C1C_100%)] text-transparent bg-clip-text",
  "purple-gradient-500":
    "bg-[linear-gradient(267deg,#39007F_0%,#6600E5_100%)] text-transparent bg-clip-text",
  "yellow-gradient-500":
    "bg-[linear-gradient(267deg,#996300_0%,#FFA600_100%)] text-transparent bg-clip-text",
  "lemon-gradient-500":
    "bg-[linear-gradient(267deg,#6F8C0F_0%,#BFF21A_100%)] text-transparent bg-clip-text",
};

export function SkillBoard() {
  return (
    <div className="border border-[#25252A] rounded-2xl p-4 bg-transparent text-white">
      <Link
        href="/account"
        className="flex items-center justify-center w-full border h-[52px] rounded-full gap-2 border-[#25252a]"
      >
        <p className="text-md">Minha conta</p>
        <Crown className="text-[#FF9D00]" />
      </Link>
      <div className="mt-10 space-y-4">
        {skills.map((skill) => (
          <div key={skill.name} className="flex items-center justify-between">
            <span
              className={cn(
                "text-sm font-bold",
                gradientClasses[skill.nameColor] || skill.color
              )}
            >
              {skill.name}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs">{skill.value}%</span>
              <Progress value={skill.value} className={skill.color} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center text-sm text-gray-400 cursor-pointer hover:text-white">
        Mostrar mais &gt;
      </div>
    </div>
  );
}
