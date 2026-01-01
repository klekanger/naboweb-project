"use client";

import { InputGroup, TextField } from "@heroui/react";
import { SearchIcon } from "lucide-react";
import type React from "react";

type CustomSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
};

/**
 * Renders a custom search input component with consistent styling.
 *
 * @param props.value - The current value of the input (required).
 * @param props.onChange - Handler for value changes (required).
 * @param props.placeholder - Placeholder text (optional).
 * @param props.onKeyDown - Handler for keyboard events (optional).
 * @param props.className - Additional CSS class name(s) (defaults to "flex-1").
 * @param props.type - Input type (defaults to "search").
 */
export default function CustomSearchInput({
  value,
  onChange,
  placeholder = "Søk...",
  onKeyDown,
  className = "flex-1",
  type = "search",
}: CustomSearchInputProps) {
  return (
    <TextField
      className={className}
      value={value}
      onChange={(newValue) => onChange(newValue || "")}
    >
      <InputGroup className="bg-gray-100 h-full">
        <InputGroup.Prefix>
          <SearchIcon className="w-6 h-6 text-brand-black" />
        </InputGroup.Prefix>
        <InputGroup.Input
          placeholder={placeholder}
          type={type}
          onKeyDown={onKeyDown}
        />
      </InputGroup>
    </TextField>
  );
}
