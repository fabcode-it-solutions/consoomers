"use client";
import * as React from "react";
import { unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui";

interface OtpFieldProps {
  handleSubmit: (value: string) => void;
  setValue: (value: string) => void;
}

const OtpField: React.FC<OtpFieldProps> = ({ handleSubmit, setValue }) => (
  <OneTimePasswordField.Root className="flex justify-center gap-2" autoSubmit onAutoSubmit={handleSubmit} onValueChange={setValue}>
    {[...Array(6)].map((_, i) => (
      <OneTimePasswordField.Input
        key={i}
        className="w-15 h-15 max-tab-sm:w-12 max-tab-sm:h-12  bg-[#FAF6F2] rounded-[12px] text-base text-center font-medium focus:outline-none focus:ring-2 "
      />
    ))}
    <OneTimePasswordField.HiddenInput />
  </OneTimePasswordField.Root>
);

export default OtpField;
