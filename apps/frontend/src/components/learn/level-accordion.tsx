"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { cn } from "@/lib/utils";
import { LevelProgressBar } from "./level-progress-bar";

export function LevelAccordion() {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  function handleChange(value: string | undefined) {
    setOpenItem(value);
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="lg:hidden block p-0 pb-4"
      value={openItem}
      onValueChange={handleChange}
    >
      <AccordionItem value="item-1" className="p-0">
        <div className="w-full max-w-[1020px] mx-auto lg:rounded-[20px] rounded-none bg-[#0C0C0F] border border-[#2A2A2A] shadow-2xl relative">
          <AccordionTrigger className="group w-full lg:px-8 px-4 pt-6 pb-10 flex flex-col justify-between items-center">
            <div className="flex justify-between w-full items-center">
              <div className="flex items-center justify-center flex-col w-full">
                <span className="text-[#787878] lg:text-[20px] text-[16px] font-medium">
                  ReactJS Level
                </span>
                <LevelProgressBar />
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="lg:px-8 px-6 pb-16 text-white">
            <p>oi</p>
          </AccordionContent>

          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2
               bg-[#25252A] w-[64px] h-[24px] flex items-center justify-center rounded-t-md cursor-pointer"
            onClick={() => {
              setOpenItem(openItem === "item-1" ? undefined : "item-1");
            }}
          >
            <ChevronDown
              className={cn(
                "text-white transition-transform duration-300",
                openItem === "item-1" && "rotate-180"
              )}
              size={24}
            />
          </div>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
