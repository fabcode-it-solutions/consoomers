"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import type { State } from "react-country-state-city/dist/esm/types";

interface Props {
  countryId?: number;
  onSelect: (state: State | null) => void;
  disabled?: boolean;
  error?: string;
  value?: string; // ✅ Add value prop to control the selected state
}

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
  "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
  "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

const StateDropdown: React.FC<Props> = ({
  onSelect,
  disabled,
  error,
  value, 
}) => {
  return (
    <div className="relative">
      <label className="text-base font-normal block mb-1">
        Your state of residency <span className="text-red-500 ml-1">*</span>
      </label>

      <div className="relative">
        <select
          disabled={disabled}
          value={value || ""} 
          onChange={(e) => {
            const stateName = e.target.value;
            onSelect(stateName ? ({ id: 0, name: stateName } as State) : null);
          }}
          className={`w-full appearance-none px-4 py-3 rounded-none outline-none border border-gray-200 cursor-pointer pr-10 ${
            disabled ? "bg-gray-100 !cursor-not-allowed opacity-55" : ""
          }`}
        >
          <option value="" disabled>
            Select State
          </option>
          {US_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        <ChevronDown
          className="absolute right-[20px] top-1/2 -translate-y-1/2 text-black pointer-events-none"
          size={16}
        />
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default StateDropdown;
