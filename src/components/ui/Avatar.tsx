import { ImgHTMLAttributes } from "react";
import { cn } from "@/core/utils";

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: "sm" | "md" | "lg" | "xl";
  initials?: string;
  isOnline?: boolean;
}

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const bgColors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
];

function hashInitials(initials: string): number {
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % bgColors.length;
}

export function Avatar({
  size = "md",
  initials,
  isOnline,
  src,
  className,
  alt = "Avatar",
  ...props
}: AvatarProps) {
  if (src) {
    return (
      <div className={cn("relative inline-flex")}>
        <img
          src={src}
          alt={alt}
          className={cn(
            sizes[size],
            "rounded-full object-cover",
            className
          )}
          {...props}
        />
        {isOnline && (
          <span className={cn(
            "absolute bottom-0 right-0 rounded-full bg-green-500 border-2 border-white",
            size === "sm" && "h-2.5 w-2.5",
            size === "md" && "h-3 w-3",
            size === "lg" && "h-3.5 w-3.5",
            size === "xl" && "h-4 w-4"
          )} />
        )}
      </div>
    );
  }

  const bgColor = initials ? bgColors[hashInitials(initials)] : "bg-gray-300";

  return (
    <div className={cn("relative inline-flex")}>
      <div
        className={cn(
          sizes[size],
          bgColor,
          "rounded-full flex items-center justify-center text-white font-semibold",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base",
          size === "xl" && "text-lg",
          className
        )}
      >
        {initials}
      </div>
      {isOnline && (
        <span className={cn(
          "absolute bottom-0 right-0 rounded-full bg-green-500 border-2 border-white",
          size === "sm" && "h-2.5 w-2.5",
          size === "md" && "h-3 w-3",
          size === "lg" && "h-3.5 w-3.5",
          size === "xl" && "h-4 w-4"
        )} />
      )}
    </div>
  );
}
