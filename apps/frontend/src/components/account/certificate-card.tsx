"use client";

import { useState } from "react";
import { CertificateIcon } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { CertificateListItem } from "./certificate-list-item";
import { CertificateModal } from "./certificate-modal";
import type { CompletedCourse } from "@/types/user-course.ts";

interface CertificateCardProps {
  course: CompletedCourse;
  statusLabel?: string;
}

export function CertificateCard({ course, statusLabel }: CertificateCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <CertificateListItem
        title={course.title}
        iconUrl={course.icon}
        statusLabel={statusLabel}
        action={
          <Button
            type="button"
            onClick={() => setIsOpen(true)}
            variant="outline"
            size="sm"
            className="h-[42px] border-[#272727] bg-gray-gradient-first px-4 font-semibold text-white hover:opacity-90"
          >
            <CertificateIcon size={18} className="mr-2" />
            Ver certificado
          </Button>
        }
      />
      <CertificateModal
        open={isOpen}
        onOpenChange={setIsOpen}
        course={course}
      />
    </>
  );
}
