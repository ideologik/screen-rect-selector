// src/components/Canvas.tsx
import React from "react";
import type {
  ReactNode,
  DragEvent,
  ChangeEvent,
  MouseEventHandler,
} from "react";

export interface CanvasProps {
  imageSrc?: string;
  onDropImage(e: DragEvent<HTMLDivElement>): void;
  onFileChange(e: ChangeEvent<HTMLInputElement>): void;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  onMouseMove?: MouseEventHandler<HTMLDivElement>;
  onMouseUp?: MouseEventHandler<HTMLDivElement>;
  children: ReactNode;
}

// Usamos forwardRef para exponer el ref de App hacia el <div>
export const Canvas = React.forwardRef<HTMLDivElement, CanvasProps>(
  (
    {
      imageSrc,
      onDropImage,
      onFileChange,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      children,
    },
    ref
  ) => (
    <div
      ref={ref}
      onDrop={onDropImage}
      onDragOver={(e) => e.preventDefault()}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: imageSrc
          ? `url(${imageSrc}) center/100% 100% no-repeat`
          : "#333",
        cursor: imageSrc ? "crosshair" : "default",
      }}
    >
      {!imageSrc && (
        <div style={{ position: "absolute", top: 10, left: 10, color: "#fff" }}>
          Arrastra o{" "}
          <label style={{ textDecoration: "underline", cursor: "pointer" }}>
            selecciona archivo
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              style={{ display: "none" }}
            />
          </label>
        </div>
      )}
      {children}
    </div>
  )
);
