import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap text-xs sm:text-sm font-mono font-bold uppercase border-[3px] border-foreground bg-background text-foreground px-4 py-2 hover:bg-muted active:translate-x-[2px] active:translate-y-[2px] shadow-[4px_4px_0_0_var(--foreground)] active:shadow-none transition-all outline-none disabled:pointer-events-none disabled:opacity-50",
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
