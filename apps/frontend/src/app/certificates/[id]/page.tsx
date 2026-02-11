import { getCertificateById } from "@/actions/certificate/get-certificate-by-id";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Medal, CheckCircle2 } from "lucide-react";
import NextImage from "next/image";
import codeLegendsLogo from "../../../../public/code-legends-logo.svg";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CertificatePageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificatePage({
  params,
}: CertificatePageProps) {
  const { id } = await params;
  const certificateData = await getCertificateById(id);

  if (!certificateData || !certificateData.verified) {
    notFound();
  }

  const { certificate } = certificateData;
  const createdAt = new Date(certificate.createdAt);

  return (
    <div className="min-h-screen bg-[#121214] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <NextImage
              src={codeLegendsLogo}
              alt="Code Legends"
              width={200}
              height={30}
              className="h-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Verificação de Certificado
          </h1>
          <p className="text-muted-foreground">
            Verifique a autenticidade deste certificado
          </p>
        </div>

        {/* Status de Validação */}
        <Card className="border-[#25252a] mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-left space-x-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-green-500 font-semibold text-lg">
                  Certificado Válido
                </p>
                <p className="text-muted-foreground text-sm">
                  Este certificado foi emitido pela Code Legends e é autêntico
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview do Certificado */}
        <Card className="bg-[#121214] rounded-[24px] shadow-xl p-8 border border-[#25252a] mb-6">
          <CardContent className="p-0">
            <div className="text-center space-y-6">
              {/* Logo Code Legends */}
              <div className="flex justify-center mb-4">
                <NextImage
                  src={codeLegendsLogo}
                  alt="Code Legends"
                  width={150}
                  height={20}
                  className="h-auto"
                />
              </div>

              {/* Título com Gradient */}
              <div className="space-y-2">
                <span className="bg-blue-gradient-500 bg-clip-text text-transparent font-bold text-2xl">
                  CERTIFICADO DE CONCLUSÃO
                </span>
              </div>

              {/* Conteúdo do Certificado */}
              <div className="space-y-4 mt-8">
                <div className="text-[#c4c4cc] text-sm">Certificamos que</div>

                <div className="rounded-lg px-4 py-3">
                  <div className="text-white font-semibold text-2xl">
                    {certificate.user.name}
                  </div>
                </div>

                <div className="rounded-lg px-4 py-3">
                  <div className="text-[#c4c4cc] text-sm">
                    concluiu com sucesso o curso de {certificate.course.title}
                  </div>
                </div>

                <div className="rounded-lg px-4 py-3">
                  <div className="text-[#c4c4cc] text-sm">
                    Emitido em{" "}
                    {createdAt.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#666666] mt-6">
                ID: {certificate.id}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Detalhadas */}
        <Card className="border-[#25252a] p-8">
          <CardHeader>
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Medal className="w-6 h-6 text-[#00c8ff]" />
              <span>Informações do Certificado</span>
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">
                  ID do Certificado
                </p>
                <p className="text-white font-mono text-sm">{certificate.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Estudante</p>
                <p className="text-white">{certificate.user.name}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  {certificate.user.email}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Curso</p>
                <p className="text-white">{certificate.course.title}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Instrutor: {certificate.course.instructor.name}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">
                  Data de Emissão
                </p>
                <p className="text-white">
                  {createdAt.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nota para Recrutadores */}
        <div className="mt-6 p-8 border border-[#25252a] rounded-lg">
          <p className="text-muted-foreground text-sm text-center">
            <strong className="text-white">Para recrutadores:</strong> Este
            certificado pode ser verificado a qualquer momento através desta
            URL. Certificados válidos exibem o status de validação acima.
          </p>
        </div>
      </div>
    </div>
  );
}
