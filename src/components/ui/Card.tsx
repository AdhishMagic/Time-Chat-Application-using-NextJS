import { ReactNode } from "react";
import { cn } from "@/core/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({
  children,
  className,
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white shadow-sm border border-gray-200",
        hoverable && "hover:shadow-md transition-shadow duration-200 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-200", className)}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-4 border-t border-gray-200", className)}>
      {children}
    </div>
  );
}
