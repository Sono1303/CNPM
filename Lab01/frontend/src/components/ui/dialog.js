import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

export function Dialog({ open, onOpenChange, children }) {
  const [isOpen, setIsOpen] = useState(Boolean(open));

  // sync with controlled prop if provided
  useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);

  const handleOpenChange = (val) => {
    setIsOpen(val);
    onOpenChange?.(val);
  };

  return (
    <>
      {React.Children.map(children, (child) => {
        if (!child) return null;
        const typeName = child.type?.displayName;
        if (typeName === "DialogTrigger") {
          // clone trigger and give it an onClick to open the dialog
          return React.cloneElement(child, { onClick: () => handleOpenChange(true), onOpenChange: handleOpenChange });
        }
        if (typeName === "DialogContent") {
          // only render content when open
          return isOpen ? React.cloneElement(child, { open: isOpen, onOpenChange: handleOpenChange }) : null;
        }
        return child;
      })}
    </>
  );
}

export function DialogTrigger({ children, onClick }) {
  return <span onClick={onClick}>{children}</span>;
}
DialogTrigger.displayName = "DialogTrigger";

export function DialogContent({ children, open, onOpenChange, showCloseButton = true }) {
  const content = (
    <>
      {/* backdrop first (lower z) */}
      <div className="fixed inset-0 bg-black/50" style={{ zIndex: 9998 }} onClick={() => onOpenChange(false)} />
      {/* panel above backdrop */}
      <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
        <div
          tabIndex={-1}
          className="bg-background rounded-lg border pt-6 md:pt-8 px-6 pb-6 md:pb-8 shadow-lg max-w-lg w-full relative max-h-[80vh] overflow-y-auto"
          style={{ zIndex: 10000 }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
          {showCloseButton && (
            <button className="absolute top-4 right-4 opacity-70 hover:opacity-100" onClick={() => onOpenChange(false)}>
              ×
            </button>
          )}
        </div>
      </div>
    </>
  );

  return typeof document !== "undefined" ? ReactDOM.createPortal(content, document.body) : content;
}
DialogContent.displayName = "DialogContent";

export function DialogHeader({ children, className = "" }) {
  // normal header spacing (no negative margin) so top spacing is controlled by panel padding
  return <div className={`flex flex-col gap-1 text-center sm:text-left ${className}`}>{children}</div>;
}
DialogHeader.displayName = "DialogHeader";

export function DialogTitle({ children, className = "" }) {
  return <div className={`text-2xl leading-none font-semibold text-gray-900 ${className}`}>{children}</div>;
}
DialogTitle.displayName = "DialogTitle";
