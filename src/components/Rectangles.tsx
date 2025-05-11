import React from "react";
import { Rnd } from "react-rnd";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface RectanglesProps<T> {
  items: T[];
  getKey(item: T, i: number): string;
  getRect(item: T): Rect;
  onDragResize(i: number, rect: Rect): void;
  onDoubleClick(i: number): void;
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
}: RectanglesProps<T>) {
  return (
    <>
      {items.map((item, i) => {
        const { x, y, w, h } = getRect(item);
        return (
          <Rnd
            key={getKey(item, i)}
            size={{ width: w, height: h }}
            position={{ x, y }}
            bounds="parent"
            onDragStop={(_, d) => onDragResize(i, { x: d.x, y: d.y, w, h })}
            onResizeStop={(_, __, el, __2, pos) =>
              onDragResize(i, {
                x: pos.x,
                y: pos.y,
                w: el.offsetWidth,
                h: el.offsetHeight,
              })
            }
            onDoubleClick={() => onDoubleClick(i)}
            style={style}
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
