import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-mono font-bold uppercase border-[3px] border-foreground px-4 py-2 hover:bg-muted active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all outline-none disabled:pointer-events-none disabled:opacity-50",
          variant === "default" 
            ? "bg-foreground text-background shadow-[4px_4px_0_0_rgba(0,0,0,0.15)] hover:opacity-90" 
            : "bg-background text-foreground shadow-[4px_4px_0_0_var(--foreground)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
