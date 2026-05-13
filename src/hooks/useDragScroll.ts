"use client";

import { useState, useEffect, useCallback } from "react";

export function useDragScroll() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const preventSelect = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input") ||
        target.closest("select") ||
        target.closest("textarea") ||
        target.closest("label") ||
        target.closest("[role='dialog']")
      ) {
        return;
      }
      isDown = true;
      startX = e.clientX;
      scrollLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
      document.addEventListener("selectstart", preventSelect);
    };

    const onMouseLeave = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "grab";
      document.removeEventListener("selectstart", preventSelect);
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "grab";
      document.removeEventListener("selectstart", preventSelect);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const walk = (e.clientX - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mousemove", onMouseMove);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("selectstart", preventSelect);
    };
  }, [el, preventSelect]);

  return setEl;
}
