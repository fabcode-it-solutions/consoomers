"use client";
import React, { useState } from "react";

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}

const TagInput = ({ label, tags, onChange }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    if (!inputValue.trim()) return;
    onChange([...tags, inputValue.trim()]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (index: number) => {
    const updated = tags.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-medium">{label}</label>}

      <div className="flex items-center gap-2">
        <input
          className="border border-gray-300  w-full px-4 py-3"
          placeholder="Add a tag"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={addTag}
          className="bg-blue-500 text-white px-4 py-3 "
        >
          +
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-gray-200 px-3 py-1  flex items-center gap-2"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-red-500 font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagInput;
