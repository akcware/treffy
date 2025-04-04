import * as React from "react";
import { cn } from "./utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  className,
}: TooltipProps) {
  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  return (
    <div className="relative flex group">
      {children}
      <div
        className={cn(
          "absolute z-50 px-2 py-1 bg-popover text-popover-foreground rounded-md text-sm shadow-md",
          "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity",
          positionClasses[position],
          className
        )}
      >
        {content}
      </div>
    </div>
  );
}