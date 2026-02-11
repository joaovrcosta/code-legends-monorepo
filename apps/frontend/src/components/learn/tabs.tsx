"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const tabs = [
  { id: "learn", label: "Aprender", path: "/learn" },
  { id: "courses", label: "Cursos", path: "/learn/catalog" },
  { id: "hq", label: "Quartel General", path: "/learn/hq" },
  { id: "stats", label: "Estatísticas", path: "/stats" },
  { id: "use-cases", label: "Casos de uso", path: "/use-cases" },
  { id: "insights", label: "Insights", path: "/insights" },
];

export function Tabs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="w-full flex items-center z-50">
      {/* Sheet para mobile (sm e md) */}
      <div className="md:hidden block">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="ml-4">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col space-y-4 mt-4">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "ghost" : "outline"}
                  onClick={() => {
                    setActiveTab(tab.id);
                    router.push(tab.path);
                  }}
                  className="w-full text-left"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Tabs para desktop (md e acima) */}
      <div className="w-full hidden md:flex lg:space-x-[5.4rem] md:space-x-3 ml-4">
        {tabs.map((tab) => (
          <div key={tab.id} className="relative group">
            <Button
              variant={activeTab === tab.id ? "ghost" : "outline"}
              onClick={() => {
                setActiveTab(tab.id);
                router.push(tab.path);
              }}
              className={`relative z-10 px-4 py-2 rounded-xl transition duration-300 ${
                activeTab === tab.id
                  ? "text-white hover:bg-transparent hover:text-white"
                  : "text-white border-none bg-transparent hover:bg-transparent hover:text-white font-normal"
              }`}
            >
              {tab.label}
            </Button>
            <div
              className={`absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-[#00c8ff] via-[rgb(0 78 99)] to-blue-500 will-change-[opacity] ${
                activeTab === tab.id ? "opacity-100" : "opacity-0"
              }`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
