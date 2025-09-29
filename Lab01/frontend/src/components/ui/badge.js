import React from "react";
import { cn } from "./utils";

const badgeVariants = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  destructive: "border-transparent bg-destructive text-white",
  outline: "text-foreground",
};

export function Badge({ className = "", variant = "default", asChild = false, children, ...props }) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-md border px-3 py-1 text-sm font-medium w-fit whitespace-nowrap shrink-0 gap-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden",
    badgeVariants[variant],
    className
  );

  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, { className: cn(child.props?.className, classes), ...props });
  }

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
