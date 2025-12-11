import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border-[3px] border-foreground bg-background text-sm font-semibold uppercase tracking-wide transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-neo-sm hover:-translate-y-[3px] hover:-translate-x-[3px]",
  {
    variants: {
      variant: {
        default: "border-foreground bg-primary text-primary-foreground shadow-neo-sm hover:bg-primary/90",
        destructive: "border-foreground bg-destructive text-destructive-foreground shadow-neo-sm hover:bg-destructive/90",
        outline: "border-foreground bg-card text-foreground",
        secondary: "border-foreground bg-secondary text-secondary-foreground shadow-neo-sm hover:bg-secondary/80",
        ghost: "border-dashed border-foreground/40 bg-transparent text-foreground shadow-none hover:border-foreground hover:shadow-neo-xs",
        link: "border-none bg-transparent p-0 text-primary underline underline-offset-4 shadow-none hover:no-underline hover:text-primary/80"
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 px-4",
        lg: "h-14 px-10",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
