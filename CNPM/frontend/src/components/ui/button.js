import React from "react";
import { cn } from "./utils";

const buttonVariants = {
  default: "bg-blue-600 text-white hover:bg-blue-700",
  success: "bg-green-600 text-white hover:bg-green-700",
  "success-light": "bg-green-100 text-green-800 hover:bg-green-200",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
  outline: "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline"
};

const sizeVariants = {
  default: "h-10 px-6 py-2 rounded-full",
  sm: "h-8 rounded-md px-3",
  lg: "h-10 rounded-md px-6",
  icon: "h-9 w-9 rounded-md"
};

export const Button = React.forwardRef(function Button(
  { className = "", variant = "default", size = "default", asChild = false, children, ...props },
  ref
) {
  const Comp = asChild ? React.Children.only(children) : "button";
  const classes = cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    buttonVariants[variant],
    sizeVariants[size],
    className
  );

  if (asChild) {
    // Clone the single child and merge props so wrappers (like DialogTrigger asChild)
    // receive the needed event handlers and refs
    return React.cloneElement(Comp, { ref, className: cn(Comp.props?.className, classes), ...props });
  }

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});

Button.displayName = "Button";
