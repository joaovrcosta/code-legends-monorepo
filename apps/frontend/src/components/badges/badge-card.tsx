import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { PrimaryButton } from "../ui/primary-button";
import { TestTube } from "@phosphor-icons/react/dist/ssr";

interface BadgeCardProps {
  className?: string;
  badgeTitle: string;
  badgeSubtitle: string;
  badgeImage: string;
  buttonText?: string;
  description?: string;
}

export function BadgeCard({
  badgeTitle,
  badgeSubtitle,
  badgeImage,
  buttonText = "Fazer Teste",
}: BadgeCardProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value={badgeTitle?.toLowerCase().replace(/\s+/g, "-")}
        className="w-full bg-gray-gradient border shadow-lg border-[#25252A] pb-4 pt-4 px-4 rounded-[20px] transition-colors duration-300 hover:bg-[#1A1A1E]/40 cursor-pointer"
      >
        <AccordionTrigger className="flex items-center justify-between">
          <div>
            <div className="flex items-center justify-end space-x-3">
              <div>
                <Image src={badgeImage} alt="Badge" width={80} height={80} />
              </div>
              <div>
                <p className="font-light text-[12px] text-[#C2C2C2]">
                  {badgeSubtitle}
                </p>
                <div className="flex items-center space-x-1">
                  <span className="font-bold bg-clip-text text-lg text-gray-400">
                    {badgeTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="mt-4 flex flex-col items-center gap-4 w-full">
            <p className="text-sm text-gray-300">Teste seus conhecimentos</p>
            <PrimaryButton>
              {buttonText} <TestTube size={32} />
            </PrimaryButton>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
