"use client";

import { useState } from "react";
import { generateCertificate } from "@/actions/course/generate-certificate";
import { Button } from "../ui/button";
import { CertificateModal } from "./certificate-modal";
import type { CompletedCourse } from "@/types/user-course.ts";
import { CertificateIcon } from "@phosphor-icons/react/dist/ssr";

interface GenerateCertificateButtonProps {
  courseId: string;
  course: CompletedCourse;
  variant?: "button" | "link";
}

export function GenerateCertificateButton({
  courseId,
  course,
  variant = "button",
}: GenerateCertificateButtonProps) {
  const initialCertificateId =
    !course.certificateId || course.certificateId === "null"
      ? null
      : course.certificateId;

  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(
    initialCertificateId
  );

  const handleOpenModal = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      // Gera o certificado na API primeiro
      const result = await generateCertificate(courseId);

      const newCertificateId: string | null =
        (result && typeof result === "object" && "data" in result
          && result.data
          && typeof result.data === "object"
          && "certificate" in result.data
          && (result.data as { certificate?: { id?: string } }).certificate?.id) ??
        course.certificateId ??
        null;

      if (newCertificateId) {
        setCertificateId(newCertificateId);
      }

      setIsOpen(true);
    } catch (error) {
      console.error("Erro ao gerar certificado:", error);
      alert(
        error instanceof Error ? error.message : "Erro ao gerar certificado"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {variant === "link" ? (
        <button
          type="button"
          onClick={handleOpenModal}
          disabled={isGenerating}
          className="shrink-0 text-sm text-muted transition-colors hover:text-white disabled:opacity-50"
        >
          {isGenerating ? "Gerando..." : "Ver certificado"}
        </button>
      ) : (
        <Button
          onClick={handleOpenModal}
          disabled={isGenerating}
          variant="outline"
          size="sm"
          className="w-full bg-gray-gradient-first hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-[0_0_12px_#1a1a1a] h-[42px] border-[#272727]"
        >
          <CertificateIcon size={18} className="mr-2" />
          {isGenerating ? "Gerando..." : "Ver certificado"}
        </Button>
      )}
      <CertificateModal
        open={isOpen}
        onOpenChange={setIsOpen}
        course={{
          ...course,
          certificateId: certificateId ?? course.certificateId,
        }}
      />
    </>
  );
}
