import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "~/helpers/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-green-600 text-white hover:bg-green-500 active:bg-green-700",
        outline: "border border-gray-400 text-gray-200 hover:bg-gray-700 active:bg-gray-600",
        link: "text-gray-300 hover:text-gray-400",
      },
      size: {
        default: "h-9 px-3 text-sm",
        large: "h-12 px-4 text-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
