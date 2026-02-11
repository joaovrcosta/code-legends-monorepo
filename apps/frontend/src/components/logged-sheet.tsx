import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronRight, Menu, User } from "lucide-react";
import Link from "next/link";
import { PrimaryButton } from "./ui/primary-button";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function LoggedSheet() {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger>
          <div className="flex items-center p-2 space-x-4 rounded-lg border border-[#25252A]">
            <Menu size={28} color="#c4c4cc" />
          </div>
        </SheetTrigger>
        <SheetContent side="left" className="bg-[#121214] p-4">
          <DialogTitle className="text-[#c4c4cc]"> </DialogTitle>{" "}
          <div className="flex flex-col space-y-4">
            <a
              href=""
              className="text-[#c4c4cc] p-2 hover:bg-[#202024] rounded-lg"
            >
              Conteúdos gratuitos
            </a>
            <a
              href=""
              className="text-[#c4c4cc] p-2 hover:bg-[#202024] rounded-lg"
            >
              Cursos
            </a>
            <a
              href=""
              className="text-[#c4c4cc] p-2 hover:bg-[#202024] rounded-lg"
            >
              Contato
            </a>
            <hr className="border-[#c4c4cc]" />
            <Link
              href="/login"
              className="text-[#c4c4cc] p-2 hover:bg-[#202024] rounded-lg flex items-center space-x-2"
            >
              <User size={20} />
              <span>LOGIN</span>
            </Link>
            <PrimaryButton>
              PRÉ-VENDA
              <ChevronRight />
            </PrimaryButton>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
