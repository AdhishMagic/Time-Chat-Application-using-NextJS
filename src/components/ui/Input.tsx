import { InputHTMLAttributes } from "react";
import { cn } from "@/core/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  disabled,
  type = "text",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-2 rounded-lg border bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
          disabled && "bg-gray-100 text-gray-500 cursor-not-allowed",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 font-medium flex items-center gap-1">
          <span className="inline-block">⚠</span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
