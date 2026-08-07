import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        `
          min-h-[120px]
          w-full
          rounded-xl
          border
          border-slate-200
          bg-white
          px-4
          py-3
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
});

Textarea.displayName = "Textarea";