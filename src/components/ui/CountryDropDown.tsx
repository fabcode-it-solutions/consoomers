/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { CountrySelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import type { Country } from "react-country-state-city/dist/esm/types";

interface Props {
  onSelect: (country: Country | null) => void;
  error?: string;
}

const CountryDropdown: React.FC<Props> = ({ onSelect, error }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryError, setCountryError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const usaCountry: Country = {
        id: 233,
        name: "United States",
        iso2: "US",
        iso3: "USA",
        phone_code: "1",
        numeric_code: "840",
        hasStates: true,
        capital: "Washington",
        currency: "USD",
        currency_name: "United States dollar",
        currency_symbol: "$",
        tld: ".us",
        native: "United States",
        region: "Americas",
        subregion: "Northern America",
        latitude: "38.00000000",
        longitude: "-97.00000000",
        emoji: "🇺🇸",
        emojiU: "U+1F1FA U+1F1F8",
      };

      setSelectedCountry(usaCountry);
      onSelect(usaCountry);
      setIsInitialized(true);
    }
  }, [isInitialized, onSelect]);

  const handleCountryChange = (country: any) => {
    if (!country) return;

    setSelectedCountry(country);

    const isUSA =
      country?.name === "United States" ||
      country?.iso2 === "US" ||
      country?.iso3 === "USA" ||
      country?.name?.includes("United States");

    if (!isUSA) {
      setCountryError(
        "Oh no! Consoomers is currently only available to US residents. We'll let you know when we launch in your country. Thank you for your interest in joining our community!"
      );
      onSelect(null);
    } else {
      setCountryError(null);
      onSelect(country);
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-base font-normal text-gray-700">
        Country
        <span className="text-red-500 ml-1">*</span>
      </label>

      <CountrySelect
        onChange={handleCountryChange}
        placeHolder="Select Country"
        defaultValue={selectedCountry as any}
        showFlag={true}
        containerClassName="w-full"
        inputClassName="w-full px-2 !py-1.5 rounded-none !border-none outline-none border-gray-200"
      />

      {countryError && (
        <p className="text-black font-semibold text-base mt-1">
          {countryError}
        </p>
      )}

      {error && !countryError && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default CountryDropdown;
