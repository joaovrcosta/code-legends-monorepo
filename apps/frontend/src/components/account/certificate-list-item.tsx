import Image from "next/image";
import type { ReactNode } from "react";

interface CertificateListItemProps {
  title: string;
  iconUrl?: string | null;
  statusLabel?: string;
  action: ReactNode;
}

export function CertificateListItem({
  title,
  iconUrl,
  statusLabel = "Concluído",
  action,
}: CertificateListItemProps) {
  const imageSrc = iconUrl?.trim() || "/certificate-image.png";

  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-[20px] border border-[#333333] bg-transparent p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Image
          src={imageSrc}
          alt=""
          width={52}
          height={52}
          className="h-[52px] w-[52px] shrink-0 object-contain"
        />
        <div className="min-w-0">
          <h3 className="truncate font-medium text-white">{title}</h3>
          <p className="mt-1 text-xs text-muted">{statusLabel}</p>
        </div>
      </div>

      <div className="shrink-0">{action}</div>
    </div>
  );
}
