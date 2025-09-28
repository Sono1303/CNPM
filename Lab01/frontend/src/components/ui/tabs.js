import React, { useState, useEffect } from "react";

export function Tabs({ defaultValue, value, onValueChange, children, className = "" }) {
  const [active, setActive] = useState(value ?? defaultValue);

  // if parent controls the value, keep internal state in sync
  useEffect(() => {
    if (value !== undefined) setActive(value);
  }, [value]);
  // Find all TabsList and TabsContent children
  let list = null;
  const contents = [];
  React.Children.forEach(children, child => {
    if (child && child.type && child.type.displayName === "TabsList") list = child;
    if (child && child.type && child.type.displayName === "TabsContent") contents.push(child);
  });
  const setActiveInternal = (v) => {
    setActive(v);
    // only notify parent when it provided an onValueChange handler
    if (typeof onValueChange === 'function') onValueChange(v);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {list && React.cloneElement(list, { active, setActive: setActiveInternal })}
      {contents.map(content => React.cloneElement(content, { active }))}
    </div>
  );
}

function TabsList({ children, active, setActive, className = "" }) {
  return (
    <div className={`bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex ${className}`}>
      {React.Children.map(children, child =>
        child && child.type && child.type.displayName === "TabsTrigger"
          ? React.cloneElement(child, { active, setActive })
          : child
      )}
    </div>
  );
}
TabsList.displayName = "TabsList";

function TabsTrigger({ value, children, active, setActive, className = "" }) {
  const isActive = active === value;
  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 ${isActive ? "bg-card text-foreground" : "text-foreground"} ${className}`}
      onClick={() => setActive(value)}
    >
      {children}
    </button>
  );
}
TabsTrigger.displayName = "TabsTrigger";

function TabsContent({ value, children, active, className = "" }) {
  if (active !== value) return null;
  return (
    <div data-slot="tabs-content" className={`flex-1 outline-none ${className}`}>{children}</div>
  );
}
TabsContent.displayName = "TabsContent";

export { TabsList, TabsTrigger, TabsContent };
