import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          `
            flex
            h-11
            w-full
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-2
            text-sm
            text-slate-900
            transition-all
            duration-200
            placeholder:text-slate-400
            focus:border-indigo-500
            focus:outline-none
            focus:ring-4
            focus:ring-indigo-100
            disabled:cursor-not-allowed
            disabled:opacity-50
          `,
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";