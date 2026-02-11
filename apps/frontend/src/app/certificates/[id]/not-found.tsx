import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import NextImage from "next/image";
import codeLegendsLogo from "../../../../public/code-legends-logo.svg";

export default function CertificateNotFound() {
  return (
    <div className="min-h-screen bg-[#121214] py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <NextImage
            src={codeLegendsLogo}
            alt="Code Legends"
            width={200}
            height={30}
            className="h-auto"
          />
        </div>

        <div className="bg-[#1a1a1a] border border-[#25252a] rounded-lg p-8">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Certificado Não Encontrado
          </h1>
          <p className="text-muted-foreground mb-6">
            O certificado que você está procurando não existe ou foi removido.
            Verifique se o ID do certificado está correto.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Possíveis razões:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
              <li>• O ID do certificado está incorreto</li>
              <li>• O certificado foi removido</li>
              <li>• O link está incompleto ou inválido</li>
            </ul>
          </div>
          <div className="mt-8">
            <Link href="/">
              <Button className="bg-[#00c8ff] hover:bg-[#00b8e6] text-white">
                Voltar para a página inicial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

