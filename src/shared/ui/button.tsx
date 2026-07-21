import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-600 text-white hover:bg-primary-500 shadow-sm shadow-primary-600/20",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
        ghost:
          "hover:bg-slate-100 text-slate-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
        outline:
          "border border-slate-200 bg-transparent hover:bg-slate-50 dark:border-zinc-700 dark:hover:bg-zinc-800",
        danger: "bg-danger-600 text-white hover:bg-danger-500",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
