import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="
        w-full
        h-14
        rounded-xl
        bg-gradient-to-r
        from-violet-600
        to-purple-500
        text-white
        font-semibold
        shadow-lg
        transition-all
        duration-300
        hover:scale-[1.02]
        hover:shadow-xl
      "
    >
      {children}
    </button>
  );
}