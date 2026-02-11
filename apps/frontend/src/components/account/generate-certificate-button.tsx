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
}

export function GenerateCertificateButton({
  courseId,
  course,
}: GenerateCertificateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOpenModal = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      // Gera o certificado na API primeiro
      await generateCertificate(courseId);
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
      <CertificateModal
        open={isOpen}
        onOpenChange={setIsOpen}
        course={course}
      />
    </>
  );
}
