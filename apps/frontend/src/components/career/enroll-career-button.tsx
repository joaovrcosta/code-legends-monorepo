"use client";

import { useState } from "react";
import { enrollInCareer } from "@/actions/career";
import { Button } from "@/components/ui/button";

export function EnrollCareerButton({
  careerId,
  isEnrolled,
}: {
  careerId: string;
  isEnrolled: boolean;
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
      className="rounded-full"
    >
      {isEnrolled ? "Inscrito" : isLoading ? "Inscrevendo..." : "Inscrever-se"}
    </Button>
  );
}

