import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            {...props}
            className={`
              h-14
              w-full
              rounded-xl
              border
              border-slate-300
              bg-white
              outline-none
              transition
              focus:border-violet-500
              focus:ring-4
              focus:ring-violet-200
              ${leftIcon ? "pl-12" : "px-4"}
              ${rightIcon ? "pr-12" : ""}
            `}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";
