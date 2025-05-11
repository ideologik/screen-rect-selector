import React, { useState } from "react";
import { Rnd, type RndResizeStartCallback } from "react-rnd";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RectanglesProps<T> {
  items: T[];
  getKey(item: T, i: number): string;
  getRect(item: T): Rect;
  onDragResize(i: number, rect: Rect): void;
  onDoubleClick(i: number): void;
  /** clave del elemento actualmente seleccionado */
  selectedKey?: string | null;
  /** callback al hacer clic, recibe la clave que devuelve getKey */
  onSelectKey?: (key: string) => void;
  label: string;
  style?: React.CSSProperties;
  renderContent?(item: T): React.ReactNode;
}

export function Rectangles<T>({
  items,
  getKey,
  getRect,
  onDragResize,
  onDoubleClick,
  label,
  style,
  renderContent,
  selectedKey,
  onSelectKey,
}: RectanglesProps<T>) {
  const [lockAspect, setLockAspect] = useState(false);
  const handleResizeStart: RndResizeStartCallback = (e) =>
    setLockAspect(e.ctrlKey);

  return (
    <>
      {items.map((item, i) => {
        const key = getKey(item, i);
        const { x, y, w, h } = getRect(item);
        const isSelected = key === selectedKey;

        return (
          <Rnd
            key={key}
            size={{ width: w, height: h }}
            position={{ x, y }}
            bounds="parent"
            lockAspectRatio={lockAspect}
            onResizeStart={handleResizeStart}
            onResizeStop={(_, __, el, __2, pos) => {
              onDragResize(i, {
                x: pos.x,
                y: pos.y,
                w: el.offsetWidth,
                h: el.offsetHeight,
              });
              setLockAspect(false);
            }}
            onDragStop={(_, d) => onDragResize(i, { x: d.x, y: d.y, w, h })}
            onMouseDown={() => onSelectKey?.(key)} // 👈
            onDoubleClick={() => onDoubleClick(i)}
            style={{
              ...style,
              border: isSelected ? "3px solid yellow" : style?.border,
            }}
          >
            {renderContent ? (
              renderContent(item)
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  fontWeight: "bold",
                }}
              >
                {label}
              </div>
            )}
          </Rnd>
        );
      })}
    </>
  );
}
