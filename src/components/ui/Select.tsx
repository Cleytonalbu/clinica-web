import * as React from "react";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<
  HTMLSelectElement,
  SelectProps
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          `
            h-11
            w-full
            appearance-none
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            pr-10
            text-sm
            text-slate-900
            transition-all
            duration-200
            focus:border-indigo-500
            focus:outline-none
            focus:ring-4
            focus:ring-indigo-100
          `,
          className
        )}
        {...props}
      >
        {children}
      </select>

      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
});

Select.displayName = "Select";