import React, { useState, useRef, useEffect } from "react";

export function Select({ value, onValueChange, children }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const containerRef = useRef(null);
  const [contentWidth, setContentWidth] = useState(null);

  const handleChange = (val) => {
    if (onValueChange) onValueChange(val);
    setOpen(false);
  };

  // Measure trigger width when opening and on resize
  useEffect(() => {
    function updateWidth() {
      if (triggerRef.current && typeof triggerRef.current.getBoundingClientRect === 'function') {
        const w = Math.round(triggerRef.current.getBoundingClientRect().width);
        setContentWidth(w);
      }
    }
    if (open) updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [open]);

  // Close on outside click or Escape
  useEffect(() => {
    function handleDocClick(e) {
      if (!open) return;
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape' && open) setOpen(false);
    }
    document.addEventListener('mousedown', handleDocClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {React.Children.map(children, child => {
        if (child && child.type && child.type.displayName === "SelectTrigger") {
          return React.cloneElement(child, { open, setOpen, triggerRef, value });
        }
        if (child && child.type && child.type.displayName === "SelectContent") {
          return open ? React.cloneElement(child, { value, onValueChange: handleChange, contentWidth }) : null;
        }
        return child;
      })}
    </div>
  );
}

function SelectTrigger({ children, open, setOpen, className = "", triggerRef, value }) {
  // Recursively check if any of the trigger's children (or nested children) contains an <svg> element.
  function hasSVG(node) {
    const arr = React.Children.toArray(node);
    for (const child of arr) {
      if (!child) continue;
      // DOM svg elements have type === 'svg'
      if (typeof child.type === 'string' && child.type.toLowerCase() === 'svg') return true;
      // If element has props.children, inspect them recursively
      if (child.props && child.props.children) {
        if (hasSVG(child.props.children)) return true;
      }
    }
    return false;
  }

  const triggerContainsSVG = hasSVG(children);

  return (
    <button
      ref={triggerRef}
      type="button"
      className={`border bg-white px-3 py-1.5 rounded-lg text-base shadow-sm flex items-center ${className}`}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
    >
      {React.Children.map(children, child => {
        if (child && child.type && child.type.displayName === 'SelectValue') {
          // clone SelectValue to pass current value and left-align container
          // force the displayed value to be font-normal to avoid inherited bold styling
          return (
            <span className="flex-1 text-left font-normal">
              {React.cloneElement(child, { value })}
            </span>
          );
        }
        // If consumer provided a plain DOM element that looks like the label (e.g., span/div with flex-1),
        // clone it to enforce font-normal so trigger label is not bold.
        if (child && typeof child.type === 'string') {
          const cls = (child.props && child.props.className) || '';
          if (cls.includes('flex-1') || cls.includes('truncate') || cls.includes('text-left')) {
            const mergedClass = `${cls} font-normal`.trim();
            return React.cloneElement(child, { className: mergedClass });
          }
        }
        // If consumer supplied a top-level svg in the trigger, clone it and add rotation when open
        if (child && typeof child.type === 'string' && child.type.toLowerCase() === 'svg') {
          const existingClass = (child.props && child.props.className) || '';
          const newClass = `${existingClass} transform transition-transform ${open ? 'rotate-180' : ''}`.trim();
          return React.cloneElement(child, { className: newClass });
        }
        return child;
      })}
      {/* dropdown chevron aligned right - only render if consumer didn't include one */}
      {!triggerContainsSVG && (
        <svg
          className={`w-4 h-4 ml-2 text-gray-500 transform transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
SelectTrigger.displayName = "SelectTrigger";

function SelectContent({ children, value, onValueChange, className = "", contentWidth }) {
  const style = contentWidth ? { minWidth: `${contentWidth}px` } : undefined;
  return (
    <div style={style} className={`absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-sm z-50 ${className}`}>
      {React.Children.map(children, child =>
        child && child.type && child.type.displayName === "SelectItem"
          // pass current selection as `selectedValue` so we don't overwrite the item's own `value` prop
          ? React.cloneElement(child, { selectedValue: value, onValueChange })
          : child
      )}
    </div>
  );
}
SelectContent.displayName = "SelectContent";

function SelectItem({ value: itemValue, children, selectedValue, onValueChange, className = "" }) {
  const selected = selectedValue === itemValue;

  // Helper to detect if children (or nested children) contain an <svg>
  function childrenHasSVG(node) {
    const arr = React.Children.toArray(node);
    for (const child of arr) {
      if (!child) continue;
      if (typeof child.type === 'string' && child.type.toLowerCase() === 'svg') return true;
      if (child.props && child.props.children) {
        if (childrenHasSVG(child.props.children)) return true;
      }
    }
    return false;
  }

  const itemContainsSVG = childrenHasSVG(children);

  // If consumer passed a common single-level wrapper (like <div className="flex ..."> ... ),
  // unwrap it to normalize label/check alignment. We only unwrap one level to avoid
  // changing complex custom children.
  let renderedLabel = children;
  const arrChildren = React.Children.toArray(children);
  if (arrChildren.length === 1) {
    const only = arrChildren[0];
    if (only && only.props && only.props.className && typeof only.props.className === 'string' && only.props.className.includes('flex')) {
      // Use the inner children of that wrapper as the label content
      renderedLabel = only.props.children;
    }
  }

  // If the renderedLabel ends with an inline SVG (consumer placed their own check),
  // extract it and render it in the right slot so it's consistently right-aligned.
  let rightIcon = null;
  const labelChildren = React.Children.toArray(renderedLabel);
  if (labelChildren.length > 0) {
    const last = labelChildren[labelChildren.length - 1];
    if (last && (typeof last.type === 'string' && last.type.toLowerCase() === 'svg')) {
      rightIcon = last;
      // remove trailing svg from label
      const withoutLast = labelChildren.slice(0, -1);
      renderedLabel = withoutLast.length === 1 ? withoutLast[0] : withoutLast;
    }
  }
  // If we extracted a right icon, mark that the item contains an svg so we don't render built-in check
  const hasTrailingSVG = !!rightIcon;

  return (
    <div
      role="option"
      aria-selected={selected}
      className={`cursor-pointer text-sm ${selected ? 'bg-gray-100' : ''} ${className}`}
      onClick={() => onValueChange && onValueChange(itemValue)}
    >
      <div className="flex items-center h-9 w-full px-4 hover:bg-gray-50">
        {/* left-aligned text; inner flex ensures consumer content (text + svg) is vertically centered */}
        <div className={`flex-1 flex items-center text-left ${selected ? 'font-normal' : ''}`}>
          <div className="truncate w-full">{renderedLabel}</div>
        </div>
        {/* Render consumer trailing svg (if any) on the right, otherwise render built-in check when selected */}
        {rightIcon ? (
          <div className="ml-auto flex items-center">{rightIcon}</div>
        ) : (
          selected && !itemContainsSVG && (
            <svg className="w-4 h-4 ml-auto text-gray-600" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        )}
      </div>
    </div>
  );
}
SelectItem.displayName = "SelectItem";

function SelectValue({ children, value }) {
  // Render children if present; otherwise render the passed `value`.
  // Capitalize first letter and truncate long text.
  const raw = children ? children : value || '';
  const str = String(raw);
  const content = str.length ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  return <span className="truncate">{content}</span>;
}
SelectValue.displayName = "SelectValue";

export { SelectTrigger, SelectContent, SelectItem, SelectValue };
