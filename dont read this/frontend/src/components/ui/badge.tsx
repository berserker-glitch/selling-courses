import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-none border-[3px] border-foreground bg-background px-2.5 py-1 text-xs font-semibold uppercase tracking-wide shadow-neo-xs transition-transform duration-150 focus-visible:outline-none",
  {
    variants: {
      variant: {
        default: "border-foreground bg-primary text-primary-foreground",
        secondary: "border-foreground bg-secondary text-secondary-foreground",
        destructive: "border-foreground bg-destructive text-destructive-foreground",
        outline: "border-dashed border-foreground/50 bg-transparent text-foreground shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
