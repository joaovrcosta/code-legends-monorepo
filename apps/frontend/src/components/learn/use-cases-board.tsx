import { Lock } from "lucide-react";
import { PrimaryButton } from "../ui/primary-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export function UseCasesBoard() {
  return (
    <div>
      <section className="border border-[#25252A] rounded-2xl p-4 bg-transparent text-white xl:block lg:block hidden">
        <p>Casos de uso</p>
        {/* Botões padrão para telas grandes */}
        <div className="hidden md:block w-full space-y-3 mt-4">
          <PrimaryButton
            className="text-sm flex items-center justify-between text-[#525252] h-[52px] px-3"
            variant="secondary"
          >
            Clothes E-commerce
            <div className="bg-[#3D3D40] h-[32px] w-[32px] flex items-center justify-center rounded-full">
              <Lock className="text-white" />
            </div>
          </PrimaryButton>
          <PrimaryButton
            className="text-sm flex items-center justify-between text-[#525252] h-[52px] px-3"
            variant="secondary"
          >
            Gambling Administration{" "}
            <div className="bg-[#3D3D40] h-[32px] w-[32px] flex items-center justify-center rounded-full">
              <Lock className="text-white" />
            </div>
          </PrimaryButton>
          <PrimaryButton
            className="text-sm flex items-center justify-between text-[#525252] h-[52px] px-3"
            variant="secondary"
          >
            Soundify - Music Stream{" "}
            <div className="bg-[#3D3D40] h-[32px] w-[32px] flex items-center justify-center rounded-full">
              <Lock className="text-white" />
            </div>
          </PrimaryButton>
        </div>
      </section>
      <section className="w-full space-y-3 mt-4 lg:hidden xl:hidden block">
        <Accordion type="single" collapsible>
          <AccordionItem value="clothes-ecommerce" className="border-none">
            <AccordionTrigger className="border border-[#25252A] rounded-2xl p-4 bg-transparent text-white no-underline">
              <p>Casos de uso</p>
            </AccordionTrigger>
            <AccordionContent className="p-4">
              <div className="w-full space-y-3 mt-4">
                <PrimaryButton
                  className="text-sm flex items-center justify-between text-[#525252] h-[52px] px-3"
                  variant="secondary"
                >
                  Clothes E-commerce
                  <div className="bg-[#3D3D40] h-[32px] w-[32px] flex items-center justify-center rounded-full">
                    <Lock className="text-white" />
                  </div>
                </PrimaryButton>
                <PrimaryButton
                  className="text-sm flex items-center justify-between text-[#525252] h-[52px] px-3"
                  variant="secondary"
                >
                  Gambling Administration{" "}
                  <div className="bg-[#3D3D40] h-[32px] w-[32px] flex items-center justify-center rounded-full">
                    <Lock className="text-white" />
                  </div>
                </PrimaryButton>
                <PrimaryButton
                  className="text-sm flex items-center justify-between text-[#525252] h-[52px] px-3"
                  variant="secondary"
                >
                  Soundify - Music Stream{" "}
                  <div className="bg-[#3D3D40] h-[32px] w-[32px] flex items-center justify-center rounded-full">
                    <Lock className="text-white" />
                  </div>
                </PrimaryButton>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
