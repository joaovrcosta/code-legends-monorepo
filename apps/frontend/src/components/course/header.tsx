import Image from "next/image";
import codeLegendsLogo from "../../../public/code-legends-logo.svg";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Headset, User } from "lucide-react";
import { getCurrentUser } from "@/actions/user/get-current-user";
import { LogoutMenuItem } from "./logout-menu-item";

export default async function CourseHeader() {
  const user = await getCurrentUser();
  return (
    <div className="relative fixed top-0 left-0 w-full z-50 bg-[#121214] border-b border-[#25252A]">
      <ul className="flex justify-between items-center lg:pt-4 pt-2 lg:pb-4 pb-2 max-w-[1560px] mx-auto px-4">
        <li className="flex space-x-3 py-4">
          <Link href="/">
            <Image src={codeLegendsLogo} alt="Code Legends" />
          </Link>
        </li>
        <li className="flex space-x-2 items-center hidden lg:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-transparent border border-[#25252A] h-[42px] rounded-full"
              >
                <User className="text-[#00C8FF]" />
                <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent">
                  {user?.name || "Usuário"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#1A1A1E] border border-[#25252A] rounded-[20px] shadow-lg"
            >
              <DropdownMenuItem
                asChild
                className="px-6 py-4 w-[352px] text-white border-none rounded-[20px]"
              >
                <Link href="/account" className="flex items-center space-x-2">
                  <User className="text-[#00C8FF]" />
                  <span>Minha conta</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                asChild
                className="px-6 py-4 w-[352px] text-white border-none rounded-[20px]"
              >
                <Link href="/account" className="flex items-center space-x-2">
                  <Headset className="text-[#00C8FF]" />
                  <span>Suporte</span>
                </Link>
              </DropdownMenuItem>

              <LogoutMenuItem />
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>
    </div>
  );
}
