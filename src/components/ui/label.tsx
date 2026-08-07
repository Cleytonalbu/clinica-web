import * as React from "react";

import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({
  children,
  required = false,
  className,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        "mb-2 block text-sm font-medium text-slate-700",
        className
      )}
      {...props}
    >
      {children}

      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </label>
  );
}