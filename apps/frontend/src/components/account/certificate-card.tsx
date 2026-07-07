import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface CertificateCardProps {
  certificateId: string;
  courseName: string;
  completedAt?: Date | string | null;
}

export function CertificateCard({
  certificateId,
  courseName,
  completedAt,
}: CertificateCardProps) {
  const bgGradient =
    {
      ReactJS: "bg-blue-gradient-500",
      Performance: "bg-red-gradient-500",
      HTML: "bg-orange-gradient-500",
      "UX/UI": "bg-gradient-to-r from-purple-500 to-purple-700",
    }[courseName] || "bg-gray-700";

  return (
    <Card
      className={`rounded-lg p-3 border-[#25252a] flex items-center justify-between lg:max-w-[362px] w-full  bg-surface`}
    >
      <div className="flex flex-col">
        <h3
          className={`font-semibold ${bgGradient} bg-clip-text text-transparent`}
        >
          {courseName}
        </h3>
        {completedAt && (
          <p className="text-xs text-muted mt-1">
            Concluído em {new Date(completedAt).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>
      <Button
        asChild
        className="bg-transparent border border-[#25252a] text-white hover:bg-white/5"
      >
        <Link href={`/certificates/${certificateId}`}>Ver certificado</Link>
      </Button>
    </Card>
  );
}
