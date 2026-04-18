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
import NextImage from "next/image";

type JsPDFDoc = InstanceType<(typeof import("jspdf"))["default"]>;
import { Dancing_Script } from "next/font/google";
import codeLegendsLogo from "../../../public/code-legends-logo.svg";

const instructorSignatureFont = Dancing_Script({
  subsets: ["latin"],
  weight: ["400"],
});

const SIGNATURE_VFS_NAME = "signature-cursive.ttf";
const SIGNATURE_FAMILY = "CertificateSignature";
const SIGNATURE_FONT_URLS = [
  "/fonts/coursive-font.ttf",
  "https://raw.githubusercontent.com/google/fonts/main/ofl/dancingscript/DancingScript-Regular.ttf",
];

const POPPINS_FAMILY = "Poppins";
const POPPINS_REGULAR_VFS = "poppins-regular.ttf";
const POPPINS_BOLD_VFS = "poppins-bold.ttf";
const POPPINS_REGULAR_URLS = [
  "/fonts/Poppins-Regular.ttf",
  "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf",
];
const POPPINS_BOLD_URLS = [
  "/fonts/Poppins-Bold.ttf",
  "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf",
];

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

async function loadLogoPngDataUrlForPdf(): Promise<string | null> {
  const logoUrl = "/code-legends-logo.svg";
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  canvas.width = 212;
  canvas.height = 16;
  const img = new Image();
  img.crossOrigin = "anonymous";
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("logo load failed"));
      img.src = logoUrl;
    });
    ctx.fillStyle = "#0c0c0d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

async function loadFontIntoPdf(
  doc: JsPDFDoc,
  urls: string[],
  vfsName: string,
  family: string,
  style: "normal" | "bold"
): Promise<boolean> {
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "force-cache" });
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      doc.addFileToVFS(vfsName, arrayBufferToBase64(buf));
      doc.addFont(vfsName, family, style);
      return true;
    } catch {
      continue;
    }
  }
  return false;
}

async function registerPoppinsFonts(
  doc: JsPDFDoc
): Promise<{ regular: boolean; bold: boolean }> {
  const regular = await loadFontIntoPdf(
    doc,
    POPPINS_REGULAR_URLS,
    POPPINS_REGULAR_VFS,
    POPPINS_FAMILY,
    "normal"
  );
  const bold = await loadFontIntoPdf(
    doc,
    POPPINS_BOLD_URLS,
    POPPINS_BOLD_VFS,
    POPPINS_FAMILY,
    "bold"
  );
  return { regular, bold };
}

function setPdfFontPoppinsBoldOrFallback(
  doc: JsPDFDoc,
  poppins: { regular: boolean; bold: boolean }
) {
  if (poppins.bold) {
    doc.setFont(POPPINS_FAMILY, "bold");
  } else if (poppins.regular) {
    doc.setFont(POPPINS_FAMILY, "normal");
  } else {
    doc.setFont("helvetica", "bold");
  }
}

async function registerSignatureCursiveFont(
  doc: JsPDFDoc
): Promise<boolean> {
  return loadFontIntoPdf(
    doc,
    SIGNATURE_FONT_URLS,
    SIGNATURE_VFS_NAME,
    SIGNATURE_FAMILY,
    "normal"
  );
}

function setPdfFontSignatureCursive(
  doc: JsPDFDoc,
  hasSignatureFont: boolean
) {
  if (hasSignatureFont) {
    doc.setFont(SIGNATURE_FAMILY, "normal");
  } else {
    doc.setFont("times", "italic");
  }
}


function drawPdfGrayGradientBackground(
  doc: JsPDFDoc,
  widthMm: number,
  heightMm: number,
  steps = 180 // 🔥 aumenta resolução do gradient
) {
  // easing mais suave ainda (menos contraste no meio)
  const ease = (u: number) =>
    0.5 - Math.cos(u * Math.PI) / 2; // cosine easing (melhor pra gradiente)

  const stops = [
    { t: 0.0, r: 8, g: 8, b: 10 },
    { t: 0.25, r: 18, g: 18, b: 22 },
    { t: 0.5, r: 30, g: 30, b: 36 },
    { t: 0.75, r: 44, g: 42, b: 48 },
    { t: 1.0, r: 60, g: 58, b: 64 },
  ];

  const sample = (u: number) => {
    const t = Math.min(1, Math.max(0, u));

    let i = 0;
    while (i < stops.length - 1 && stops[i + 1].t < t) i++;

    const a = stops[i];
    const b = stops[i + 1];

    const span = b.t - a.t || 1;
    const w = (t - a.t) / span;

    return {
      r: Math.round(a.r + (b.r - a.r) * w),
      g: Math.round(a.g + (b.g - a.g) * w),
      b: Math.round(a.b + (b.b - a.b) * w),
    };
  };

  const stripW = widthMm / steps;

  for (let i = 0; i < steps; i++) {
    const raw = steps <= 1 ? 0 : i / (steps - 1);

    // 🔥 aplica easing aqui
    const { r, g, b } = sample(ease(raw));

    doc.setFillColor(r, g, b);
    doc.rect(i * stripW, 0, stripW + 0.02, heightMm, "F");
  }
}
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
      const normalizedId =
        !course.certificateId || course.certificateId === "null"
          ? null
          : course.certificateId;

      if (normalizedId) {
        const link = `${window.location.origin}/certificates/${normalizedId}`;
        setShareLink(link);
      } else {
        setShareLink("");
      }
    }
  }, [open, course.id, course.certificateId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Link copiado para a área de transferência!");
  };

  const handleDownloadCertificate = async () => {
    if (isDownloading || !user) return;
    setIsDownloading(true);


    try {
      const { default: JsPDF } = await import("jspdf");
      const doc = new JsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const [hasSignatureCursive, poppins] = await Promise.all([
        registerSignatureCursiveFont(doc),
        registerPoppinsFonts(doc),
      ]);

      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      drawPdfGrayGradientBackground(doc, width, height);

      doc.setDrawColor(0, 200, 255);
      doc.setLineWidth(0.5);
      doc.line(10, 10, 30, 10);
      doc.line(10, 10, 10, 30);

      const logoDataUrl = await loadLogoPngDataUrlForPdf();
      const logoWidth = 40;
      const logoHeight = 3;
      const logoX = (width - logoWidth) / 2;
      const logoY = 20;
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoWidth, logoHeight);
      } else {
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("CODE LEGENDS", width / 2, 25, { align: "center" });
      }

      doc.setFontSize(7);
      doc.setTextColor(102, 102, 102);
      doc.text("CÓDIGO DE VERIFICAÇÃO", width - 20, 22, { align: "right" });
      doc.setTextColor(150, 150, 150);
      doc.text(course.id.toUpperCase(), width - 20, 27, { align: "right" });

      doc.setFontSize(32);
      doc.setTextColor(0, 200, 255);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICADO DE CONCLUSÃO", width / 2, 55, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(196, 196, 204);
      doc.setFont("helvetica", "normal");
      doc.text(
        language === "pt" ? "Certificamos orgulhosamente que" : "This proudly certifies that",
        width / 2,
        75,
        { align: "center" }
      );

      doc.setFontSize(38);
      doc.setTextColor(255, 255, 255);
      setPdfFontPoppinsBoldOrFallback(doc, poppins);
      doc.text(user.name.toUpperCase() || "ESTUDANTE", width / 2, 95, {
        align: "center",
        maxWidth: width - 40
      });

      doc.setFontSize(14);
      doc.setTextColor(196, 196, 204);
      doc.setFont("helvetica", "normal");
      const completionText = language === "pt"
        ? `concluiu com êxito o treinamento de`
        : `has successfully completed the training of`;
      doc.text(completionText, width / 2, 110, { align: "center" });

      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      setPdfFontPoppinsBoldOrFallback(doc, poppins);
      doc.text(course.title, width / 2, 125, { align: "center" });

      const footerY = 165;

      doc.setDrawColor(60, 60, 60);
      doc.line(40, footerY + 5, 110, footerY + 5);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      setPdfFontSignatureCursive(doc, hasSignatureCursive);
      doc.text("João Victor", 75, footerY, { align: "center" });
      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);
      doc.setFont("helvetica", "normal");
      doc.text("INSTRUTOR PRINCIPAL", 75, footerY + 12, { align: "center" });

      doc.line(width / 2 + 5, footerY - 5, width / 2 + 5, footerY + 15);

      const completionDate = new Date(course.completedAt).toLocaleDateString(
        language === "pt" ? "pt-BR" : "en-US",
        { day: '2-digit', month: '2-digit', year: 'numeric' }
      );

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${course.progress || "10h"}`, width / 2 + 40, footerY + 2);
      doc.text(completionDate, width / 2 + 80, footerY + 2);

      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);
      doc.setFont("helvetica", "normal");
      doc.text(language === "pt" ? "Carga horária" : "Total hours", width / 2 + 40, footerY + 10);
      doc.text(language === "pt" ? "Data de conclusão" : "Completion date", width / 2 + 80, footerY + 10);

      doc.setFontSize(7);
      doc.setTextColor(60, 60, 60);
      const authUrl = `Para validar este certificado, acesse codelegends.com.br/verify/${course.id}`;
      doc.text(authUrl, width / 2, height - 15, { align: "center" });

      doc.save(`Certificado-${course.title.replace(/\s+/g, '-')}-${user.name}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar certificado:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-surface border-[#25252a]">
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
          <div className="rounded-[24px] shadow-xl p-8 border border-[#25252a] relative overflow-hidden">
            <div className="text-center space-y-6 relative z-10">
              <div className="flex justify-center mb-4">
                <NextImage
                  src={codeLegendsLogo}
                  alt="Code Legends"
                  width={150}
                  height={20}
                  className="h-auto"
                />
              </div>

              <div className="space-y-2">
                <span className="bg-blue-gradient-500 bg-clip-text text-transparent font-bold text-2xl">
                  CERTIFICADO DE CONCLUSÃO
                </span>
              </div>

              <div className="space-y-4 mt-8">
                <div className="text-[#c4c4cc] text-sm">
                  {language === "pt"
                    ? "Certificamos que"
                    : "This certifies that"}
                </div>

                <div className="rounded-lg px-4 py-3">
                  <div
                    className="text-white font-semibold text-2xl"
                    style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {user?.name || "Estudante"}
                  </div>
                </div>

                <div className="rounded-lg px-4 py-3">
                  <div className="text-[#c4c4cc] text-sm">
                    {language === "pt" ? (
                      <>
                        concluiu com sucesso o curso de{" "}
                        <span
                          className="text-white font-semibold"
                          style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                        >
                          {course.title}
                        </span>
                      </>
                    ) : (
                      <>
                        has successfully completed the course{" "}
                        <span
                          className="text-white font-semibold"
                          style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                        >
                          {course.title}
                        </span>
                      </>
                    )}
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

                <div className="mt-10 pt-6 border-t border-[#333333] max-w-[220px] mx-auto text-center">
                  <div
                    className={`text-white text-2xl ${instructorSignatureFont.className}`}
                  >
                    João Victor
                  </div>
                  <div className="text-[#666666] text-xs mt-2 uppercase tracking-wide">
                    {language === "pt"
                      ? "Instrutor principal"
                      : "Lead instructor"}
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#666666] mt-6">ID: {course.id}</div>
            </div>
          </div>

          <div className="space-y-6">
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
