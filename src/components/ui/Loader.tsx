import { cn } from "@/core/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  fullscreen?: boolean;
  label?: string;
}

const sizes = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Loader({
  size = "md",
  fullscreen = false,
  label,
}: LoaderProps) {
  const spinner = (
    <div className="flex items-center justify-center gap-3">
      <div
        className={cn(
          sizes[size],
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
        )}
      />
      {label && <span className="text-gray-600">{label}</span>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

export function SkeletonLoader({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-lg bg-gray-200 animate-pulse"
        />
      ))}
    </div>
  );
}
