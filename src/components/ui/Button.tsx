import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        flex
        h-14
        w-full
        items-center
        justify-center
        rounded-xl
        bg-gradient-to-r
        from-violet-600
        to-indigo-700
        font-semibold
        text-white
        shadow-lg
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-xl
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${className}
      `}
    >
      {children}
    </button>
  );
}
