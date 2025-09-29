import React from "react";
import { cn } from "./utils";

export function Table({ className = "", ...props }) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className = "", ...props }) {
  return <thead data-slot="table-header" className={cn("border-b", className)} {...props} />;
}

export function TableBody({ className = "", ...props }) {
  return <tbody data-slot="table-body" className={cn("", className)} {...props} />;
}

export function TableFooter({ className = "", ...props }) {
  return <tfoot data-slot="table-footer" className={cn("bg-muted/50 border-t font-medium", className)} {...props} />;
}

export function TableRow({ className = "", ...props }) {
  return <tr data-slot="table-row" className={cn("hover:bg-muted/50 border-b transition-colors", className)} {...props} />;
}

export function TableHead({ className = "", ...props }) {
  // tightened header: smaller height, less horizontal padding, left aligned
  return <th data-slot="table-head" className={cn("text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap", className)} {...props} />;
}

export function TableCell({ className = "", ...props }) {
  // tightened cell: reduce padding and use left alignment by default
  return <td data-slot="table-cell" className={cn("px-2 py-1 align-middle whitespace-nowrap text-left", className)} {...props} />;
}

export function TableCaption({ className = "", ...props }) {
  return <caption data-slot="table-caption" className={cn("text-muted-foreground mt-4 text-sm", className)} {...props} />;
}
