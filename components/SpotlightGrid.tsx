"use client";

import { useEffect, useRef } from "react";

export default function SpotlightGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        containerRef.current?.style.setProperty("--x", `${e.clientX}`);
        containerRef.current?.style.setProperty("--y", `${e.clientY}`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-ldna-bg"
      style={{ "--x": "-1000", "--y": "-1000" } as React.CSSProperties}
    >
      {/* 1. Base Layer: Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(var(--color-ldna-grid)_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* 2. Spotlight Overlay: Highlighted Grid */}
      <div
        className="absolute inset-0 bg-[radial-gradient(var(--color-ldna-accent)_1.5px,transparent_1.5px)] [background-size:32px_32px]"
        style={{
          maskImage: `radial-gradient(450px circle at calc(var(--x) * 1px) calc(var(--y) * 1px), black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(450px circle at calc(var(--x) * 1px) calc(var(--y) * 1px), black 0%, transparent 100%)`,
        }}
      />

      {/* 3. The Glow: Soft spotlight highlight */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(600px circle at calc(var(--x) * 1px) calc(var(--y) * 1px), rgba(255, 87, 26, 0.25), transparent 100%)`,
        }}
      />
    </div>
  );
}
