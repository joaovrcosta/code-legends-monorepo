import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface CertificateCardProps {
  courseName: string;
  completedAt?: Date | string | null;
}

export function CertificateCard({
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
      className={`rounded-lg p-3 border-[#25252a] flex items-center justify-between lg:max-w-[362px] w-full  bg-[#121214]`}
    >
      <div className="flex flex-col">
        <h3
          className={`font-semibold ${bgGradient} bg-clip-text text-transparent`}
        >
          {courseName}
        </h3>
        {completedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            Concluído em {new Date(completedAt).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>
      <Button className="bg-transparent border border-[#25252a] text-white">
        Ver certificado
      </Button>
    </Card>
  );
}
