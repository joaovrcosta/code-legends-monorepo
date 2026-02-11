"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { X, Copy, Download } from "lucide-react";
import { getCurrentUser } from "@/actions/user/get-current-user";
import type { User } from "@/types/user";
import type { CompletedCourse } from "@/types/user-course.ts";
import jsPDF from "jspdf";
import NextImage from "next/image";
import codeLegendsLogo from "../../../public/code-legends-logo.svg";

interface CertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CompletedCourse;
}

export function CertificateModal({
  open,
  onOpenChange,
  course,
}: CertificateModalProps) {
  const [language, setLanguage] = useState<"pt" | "en">("pt");
  const [shareLink, setShareLink] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (open) {
      getCurrentUser().then(setUser);
      // Gera o link de compartilhamento
      const link = `${window.location.origin}/certificates/${course.certificateId}`;
      setShareLink(link);
    }
  }, [open, course.id, course.certificateId]);

  // const handleGenerateCertificate = async () => {
  //   if (isGenerating) return;

  //   try {
  //     setIsGenerating(true);
  //     await generateCertificate(course.id);
  //     // Após gerar, atualiza o link se necessário
  //   } catch (error) {
  //     console.error("Erro ao gerar certificado:", error);
  //     alert(
  //       error instanceof Error ? error.message : "Erro ao gerar certificado"
  //     );
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Link copiado para a área de transferência!");
  };

  const handleDownloadCertificate = async () => {
    if (isDownloading || !user) return;

    setIsDownloading(true);

    try {
      // Carregar a imagem da logo e converter para base64 usando canvas
      const logoUrl = "/code-legends-logo.svg";

      // Criar um canvas para renderizar o SVG
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 212;
      canvas.height = 16;

      const img = new Image();
      img.crossOrigin = "anonymous";

      const logoBase64 = await new Promise<string>((resolve, reject) => {
        img.onload = () => {
          if (ctx) {
            ctx.fillStyle = "#121214"; // Fundo escuro
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/png"));
          } else {
            reject(new Error("Não foi possível criar contexto do canvas"));
          }
        };
        img.onerror = reject;
        img.src = logoUrl;
      });

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      // Background escuro (#121214)
      doc.setFillColor(18, 18, 20);
      doc.rect(0, 0, width, height, "F");

      // Logo Code Legends - adicionar imagem
      const logoWidth = 40; // largura em mm
      const logoHeight = 3; // altura em mm (proporção mantida)
      const logoX = (width - logoWidth) / 2; // centralizado
      const logoY = 20; // posição Y
      doc.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);

      // Title com gradient (simulado com cor azul)
      doc.setFontSize(36);
      doc.setTextColor(0, 200, 255); // #00C8FF
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICADO DE CONCLUSÃO", width / 2, 55, {
        align: "center",
      });

      // Subtitle
      doc.setFontSize(14);
      doc.setTextColor(196, 196, 204); // #c4c4cc
      doc.setFont("helvetica", "normal");
      doc.text(
        language === "pt" ? "Certificamos que" : "This certifies that",
        width / 2,
        75,
        { align: "center" }
      );

      // Student name
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255); // Branco
      doc.setFont("helvetica", "bold");
      doc.text(user.name || "Estudante", width / 2, 95, {
        align: "center",
        maxWidth: width - 40,
      });

      // Course completion text
      doc.setFontSize(14);
      doc.setTextColor(196, 196, 204); // #c4c4cc
      doc.setFont("helvetica", "normal");
      const completionText =
        language === "pt"
          ? `concluiu com sucesso o curso de ${course.title}`
          : `has successfully completed the course ${course.title}`;
      doc.text(completionText, width / 2, 115, {
        align: "center",
        maxWidth: width - 40,
      });

      // Date
      const completionDate = new Date(course.completedAt);
      const dateText =
        language === "pt"
          ? `Concluído em ${completionDate.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}`
          : `Completed on ${completionDate.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}`;

      doc.setFontSize(12);
      doc.setTextColor(196, 196, 204); // #c4c4cc
      doc.text(dateText, width / 2, 135, { align: "center" });

      // Certificate ID
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102); // #666666
      doc.text(`ID: ${course.id}`, width / 2, height - 20, {
        align: "center",
      });

      // Download
      doc.save(`certificado-${course.title}-${user.name}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o certificado em PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  // const handleShare = (platform: string) => {
  //   const text =
  //     language === "pt"
  //       ? `Acabei de concluir o curso ${course.title}!`
  //       : `I just completed the course ${course.title}!`;
  //   const url = encodeURIComponent(shareLink);

  //   const shareUrls: Record<string, string> = {
  //     whatsapp: `https://wa.me/?text=${encodeURIComponent(
  //       text + " " + shareLink
  //     )}`,
  //     linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
  //     twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
  //       text
  //     )}&url=${url}`,
  //     facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  //   };

  //   if (shareUrls[platform]) {
  //     window.open(shareUrls[platform], "_blank");
  //   }
  // };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#121214] border-[#25252a]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">
              Ver Certificado
            </DialogTitle>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Preview do Certificado */}
          <div className="bg-[#121214] rounded-[24px] shadow-xl p-8 border border-[#25252a] relative overflow-hidden">
            <div className="text-center space-y-6 relative z-10">
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
                <div className="text-[#c4c4cc] text-sm">
                  {language === "pt"
                    ? "Certificamos que"
                    : "This certifies that"}
                </div>

                <div className="rounded-lg px-4 py-3">
                  <div className="text-white font-semibold text-2xl">
                    {user?.name || "Estudante"}
                  </div>
                </div>

                <div className=" rounded-lg px-4 py-3">
                  <div className="text-[#c4c4cc] text-sm">
                    {language === "pt"
                      ? `concluiu com sucesso o curso de ${course.title}`
                      : `has successfully completed the course ${course.title}`}
                  </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-lg px-4 py-3 border border-[#333333]">
                  <div className="text-[#c4c4cc] text-sm">
                    {new Date(course.completedAt).toLocaleDateString(
                      language === "pt" ? "pt-BR" : "en-US",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#666666] mt-6">ID: {course.id}</div>
            </div>
          </div>

          {/* Opções */}
          <div className="space-y-6">
            {/* Idioma */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Idioma
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value="pt"
                    checked={language === "pt"}
                    onChange={(e) => setLanguage(e.target.value as "pt" | "en")}
                    className="w-4 h-4 text-[#00c8ff]"
                  />
                  <span className="text-muted-foreground">Português</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value="en"
                    checked={language === "en"}
                    onChange={(e) => setLanguage(e.target.value as "pt" | "en")}
                    className="w-4 h-4 text-[#00c8ff]"
                  />
                  <span className="text-muted-foreground">Inglês</span>
                </label>
              </div>
            </div>

            {/* Link para compartilhamento */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Link para compartilhamento
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 bg-[#1a1a1a] border border-[#333333] rounded px-3 py-2 text-sm text-white"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                  className="border-[#333333]"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Botão de Download */}
            <Button
              onClick={handleDownloadCertificate}
              disabled={isDownloading || !user}
              className="w-full bg-blue-gradient-first hover:bg-blue-gradient-second text-white"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              {isDownloading ? "Gerando PDF..." : "Baixar Certificado"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
