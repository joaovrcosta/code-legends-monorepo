import React from "react";

interface DividerWithTextProps {
  text: string;
}

const DividerWithText: React.FC<DividerWithTextProps> = ({ text }) => {
  return (
    <div className="flex items-center w-full my-4 justify-center">
      <div className="flex-grow border-t border-[#25252a] max-w-[180px]"></div>
      <span className="mx-4 text-[#4d4d52] font-medium text-[12px]">
        {text}
      </span>
      <div className="flex-grow border-t border-[#25252a] max-w-[180px]"></div>
    </div>
  );
};

export default DividerWithText;
