// renderer/RectangleSelector.tsx
import React, { useRef, useState, type FC } from "react";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  disabled?: boolean;
  onComplete: (rect: Rect) => void;
  children: React.ReactNode;
}

export const RectangleSelector: FC<Props> = ({
  disabled = false,
  onComplete,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [drawing, setDrawing] = useState(false);

  const toRelative = (clientX: number, clientY: number) => {
    const box = containerRef.current!.getBoundingClientRect();
    return { x: clientX - box.left, y: clientY - box.top };
  };

  const onPointerDown: React.PointerEventHandler = (e) => {
    if (disabled || e.button !== 0) return;
    const pos = toRelative(e.clientX, e.clientY);
    originRef.current = pos;
    setRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
    setDrawing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler = (e) => {
    if (!drawing || !originRef.current) return;
    const pos = toRelative(e.clientX, e.clientY);
    const ox = originRef.current.x;
    const oy = originRef.current.y;
    const x = Math.min(ox, pos.x);
    const y = Math.min(oy, pos.y);
    setRect({
      x,
      y,
      width: Math.abs(pos.x - ox),
      height: Math.abs(pos.y - oy),
    });
  };

  const finish: React.PointerEventHandler = (e) => {
    if (drawing) {
      if (rect && rect.width > 2 && rect.height > 2) onComplete(rect);
      setDrawing(false);
      originRef.current = null;
      setRect(null);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerLeave={finish}
    >
      {children}
      {rect && (
        <div
          style={{
            position: "absolute",
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            background: "rgba(0,128,255,0.2)",
            border: "2px solid #0080ff",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
