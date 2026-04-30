"use client";

import { useState } from "react";
import { enrollInCareer } from "@/actions/career";
import { Button } from "@/components/ui/button";

export function EnrollCareerButton({
  careerId,
  isEnrolled,
  notEnrolledLabel = "Inscrever-se",
  enrolledLabel = "Já inscrito",
  loadingLabel = "Inscrevendo...",
  className,
}: {
  careerId: string;
  isEnrolled: boolean;
  notEnrolledLabel?: string;
  enrolledLabel?: string;
  loadingLabel?: string;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    try {
      setIsLoading(true);
      await enrollInCareer(careerId);
      window.location.reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao se inscrever";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleEnroll}
      disabled={isEnrolled || isLoading}
      className={["rounded-full", className].filter(Boolean).join(" ")}
    >
      {isEnrolled
        ? enrolledLabel
        : isLoading
          ? loadingLabel
          : notEnrolledLabel}
    </Button>
  );
}

