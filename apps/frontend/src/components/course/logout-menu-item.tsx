"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { logout } from "@/actions/auth";

export function LogoutMenuItem() {
  return (
    <DropdownMenuItem
      className="px-6 py-4 w-[352px] text-white border-none rounded-[20px] cursor-pointer"
      onClick={() => logout()}
    >
      <div className="flex items-center space-x-2">
        <LogOut className="text-[#fe6e78]" />
        <span className="text-[#fe6e78]">Sair da conta</span>
      </div>
    </DropdownMenuItem>
  );
}
