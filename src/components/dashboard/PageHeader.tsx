
import React from "react";

interface PageHeaderProps {
  resetForm?: () => void
  setShowCreateModal?: (value: boolean) => void;
  heading: string;
  describe?: string;
  button?: React.ReactNode;
}
const PageHeader = ({
  heading,
  describe,
  button,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-audiowide text-[#f1f5f9]">{heading}</h1>
        <p className="text-[#BDBDBD] font-sofia-sans mt-1">
          {describe || "Define custom fields for your entities"}
        </p>
      </div>

      {button}
    </div>
  );
};

export default PageHeader;
