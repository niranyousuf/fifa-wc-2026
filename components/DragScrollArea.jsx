"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Horizontal scroll without a visible scrollbar; drag to pan (grab cursor).
 */
export function DragScrollArea({ children, className, ariaLabel }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  function endDrag(event) {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
    if (ref.current && event.pointerId !== undefined) {
      ref.current.releasePointerCapture?.(event.pointerId);
    }
  }

  function onPointerDown(event) {
    if (event.button !== 0) return;
    const el = ref.current;
    if (!el) return;

    drag.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function onPointerMove(event) {
    if (!drag.current.active || !ref.current) return;

    const delta = event.clientX - drag.current.startX;
    if (Math.abs(delta) > 4) {
      drag.current.moved = true;
    }

    ref.current.scrollLeft = drag.current.scrollLeft - delta;
  }

  function onClickCapture(event) {
    if (drag.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      drag.current.moved = false;
    }
  }

  return (
    <div
      ref={ref}
      role="region"
      aria-label={ariaLabel}
      className={cn(
        "cursor-grab overflow-x-auto overflow-y-hidden pb-2 active:cursor-grabbing",
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        dragging && "select-none",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
    >
      {children}
    </div>
  );
}
