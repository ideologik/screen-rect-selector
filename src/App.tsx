import React, { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { Canvas } from "./components/Canvas";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import { type EditingForm, EditForm } from "./components/EditForm";
import { Rectangles } from "./components/Rectangles";
import type {
  SimpleZone,
  UseZone,
  ArrElement,
  HotspotToast,
  RectDraw,
} from "./types";
import type { MouseEvent } from "react";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  const SCHEMA_VERSION = "3"; // súbelo cuando cambies shape
  const savedVersion = localStorage.getItem("appSchemaVersion");

  if (savedVersion !== SCHEMA_VERSION) {
    console.log("🧹 Limpio localStorage por cambio de esquema");
    localStorage.clear();
    localStorage.setItem("appSchemaVersion", SCHEMA_VERSION);
  }

  // estados con localStorage
  const [imageSrc, setImageSrc] = useLocalStorageState<string | undefined>(
    "imageSrc",
    undefined
  );
  const [simpleZones, setSimpleZones] = useLocalStorageState<SimpleZone[]>(
    "simpleZones",
    []
  );
  const [useZones, setUseZones] = useLocalStorageState<UseZone[]>(
    "useZones",
    []
  );
  const [arrElements, setArrElements] = useLocalStorageState<ArrElement[]>(
    "arrElements",
    []
  );
  const [hotspotToasts, setHotspotToasts] = useLocalStorageState<
    HotspotToast[]
  >("hotspotToasts", []);

  // estados de UI
  const [drawn, setDrawn] = useState<RectDraw[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [startPt, setStartPt] = useState<{ x: number; y: number }>();
  const [form, setForm] = useState<EditingForm | null>(null);

  // item seleccionado
  // App.tsx

  // dimensiones del contenedor
  const rect = containerRef.current?.getBoundingClientRect();
  const W = rect?.width ?? window.innerWidth;
  const H = rect?.height ?? window.innerHeight;

  // Rectangulo seleccionado
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Handlers de imagen
  function onDropImage(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  // Handlers de dibujo
  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    // Sólo inicio dibujo si pulsas directamente sobre el canvas,
    // no si el click viene de un hijo (p.ej. un rectángulo <Rnd>)
    if (e.target !== e.currentTarget) return;

    if (!imageSrc) return;
    setDrawing(true);

    // calcula punto inicial con la posición del canvas
    const r = containerRef.current!.getBoundingClientRect();
    setStartPt({ x: e.clientX - r.left, y: e.clientY - r.top });
  }

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!drawing || !startPt) return;
    const r = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const tmp: RectDraw = {
      id: "__tmp",
      x: Math.min(startPt.x, x),
      y: Math.min(startPt.y, y),
      width: Math.abs(x - startPt.x),
      height: Math.abs(y - startPt.y),
    };
    setDrawn((ds) => [...ds.filter((d) => d.id !== "__tmp"), tmp]);
  }
  function onMouseUp() {
    if (!drawing) return;
    setDrawing(false);
    setDrawn((ds) =>
      ds.map((d) => (d.id === "__tmp" ? { ...d, id: uuid() } : d))
    );
    setStartPt(undefined);
  }

  // Doble clic
  function onDoubleClickRect(r: RectDraw) {
    setForm({ mode: "simple", index: -1, rect: r, fitMode: "contain" });
  }

  // Guardar formulario
  function saveForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !containerRef.current) return;
    const { width: _W, height: _H } =
      containerRef.current.getBoundingClientRect();
    const { rect, mode, index } = form;
    const top = parseFloat(((rect.y / _H) * 100).toFixed(1));
    const left = parseFloat(((rect.x / _W) * 100).toFixed(1));
    const widthP = parseFloat(((rect.width / _W) * 100).toFixed(1));
    const heightP = parseFloat(((rect.height / _H) * 100).toFixed(1));

    if (mode === "simple") {
      const zone = { top, left, width: widthP, height: heightP };
      if (index < 0) {
        setSimpleZones((zs) => [...zs, zone]);
      } else {
        setSimpleZones((zs) => zs.map((z, i) => (i === index ? zone : z)));
      }
    }
    if (mode === "useZone") {
      const uz = {
        id: form.id!,
        name: form.name!,
        feedbackOnDrop: form.feedback!,
        config: {
          top,
          left,
          width: widthP,
          height: heightP,
          zIndex: 5,
          backgroundColor: "rgba(255,0,0,0.5)",
        },
        acceptedItems: form.items!.split(",").map((s) => s.trim()),
      };
      if (index < 0) {
        setUseZones((zs) => [...zs, uz]);
      } else {
        setUseZones((zs) => zs.map((z, i) => (i === index ? uz : z)));
      }
    }
    if (mode === "arrElement") {
      const ae = {
        uniqueId: uuid(),
        id: form.elId!,
        type: "buttonImg",
        text: form.elText!,
        hovered: false,
        typeElement: "hsElement",
        top,
        left,
        width: widthP,
        height: heightP,
        order: 0,
        src: form.elSrc!,
        state: "disabled",
        animationType: "hover",
        animation: "animate__pulse",
        fitMode: form.fitMode!,
      };
      if (index < 0) {
        setArrElements((aeArr) => [...aeArr, ae]);
      } else {
        setArrElements((aeArr) => aeArr.map((z, i) => (i === index ? ae : z)));
      }
    }
    if (mode === "hotspotToast") {
      const ht: HotspotToast = {
        component: "HotspotToast",
        props: {
          rect: { top, left, width: widthP, height: heightP },
          content: form.content!,
        },
      };
      if (index < 0) {
        setHotspotToasts((hs) => [...hs, ht]);
      } else {
        setHotspotToasts((hs) => hs.map((h, i) => (i === index ? ht : h)));
      }
    }
    if (index < 0) setDrawn((ds) => ds.filter((d) => d.id !== rect.id));
    setForm(null);
  }

  // Export JSON
  function exportJSON() {
    const data = { simpleZones, useZones, arrElements, hotspotToasts };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Borrar todo
  function clearAll() {
    if (!confirm("Borrar TODO?")) return;
    setImageSrc(undefined);
    setSimpleZones([]);
    setUseZones([]);
    setArrElements([]);
    setHotspotToasts([]);
    localStorage.clear();
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete" || !selectedKey) return;

      const [layer, id] = selectedKey.split("-", 2);

      switch (layer) {
        case "drawn":
          setDrawn((ds) => ds.filter((d) => d.id !== id));
          break;
        case "simple":
          setSimpleZones((zs) =>
            zs.filter((_, i) => `simple-${i}` !== selectedKey)
          );
          break;
        case "use":
          setUseZones((zs) => zs.filter((z) => `use-${z.id}` !== selectedKey));
          break;
        case "arr":
          setArrElements((ae) =>
            ae.filter((el) => `arr-${el.uniqueId}` !== selectedKey)
          );
          break;
        case "toast":
          setHotspotToasts((ht) =>
            ht.filter((_, i) => `toast-${i}` !== selectedKey)
          );
          break;
      }

      setSelectedKey(null);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    selectedKey,
    setArrElements,
    setHotspotToasts,
    setSimpleZones,
    setUseZones,
  ]);

  return (
    <Canvas
      ref={containerRef}
      imageSrc={imageSrc}
      onDropImage={onDropImage}
      onFileChange={onFileChange}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {/* temporales */}
      <Rectangles<RectDraw>
        items={drawn}
        getKey={(r) => `drawn-${r.id}`}
        getRect={(r) => ({ x: r.x, y: r.y, w: r.width, h: r.height })}
        onDragResize={(i, r) =>
          setDrawn((ds) =>
            ds.map((d, ii) =>
              ii === i ? { ...d, x: r.x, y: r.y, width: r.w, height: r.h } : d
            )
          )
        }
        onDoubleClick={(i) => onDoubleClickRect(drawn[i])}
        label="simple"
        style={{ border: "2px dashed #0f0", background: "rgba(0,255,0,0.2)" }}
        selectedKey={selectedKey}
        onSelectKey={(key) => setSelectedKey(key)}
      />

      {/* simpleZones */}
      <Rectangles<SimpleZone>
        items={simpleZones}
        selectedKey={selectedKey}
        onSelectKey={(key) => setSelectedKey(key)}
        getKey={(_, i) => `simple-${i}`}
        getRect={(z) => ({
          x: (z.left / 100) * W,
          y: (z.top / 100) * H,
          w: (z.width / 100) * W,
          h: (z.height / 100) * H,
        })}
        onDragResize={(i, r) =>
          setSimpleZones((zs) =>
            zs.map((z, ii) =>
              ii === i
                ? {
                    top: parseFloat(((r.y / H) * 100).toFixed(1)),
                    left: parseFloat(((r.x / W) * 100).toFixed(1)),
                    width: parseFloat(((r.w / W) * 100).toFixed(1)),
                    height: parseFloat(((r.h / H) * 100).toFixed(1)),
                  }
                : z
            )
          )
        }
        onDoubleClick={(i) =>
          setForm({
            mode: "simple",
            index: i,
            rect: {
              id: "",
              x: (simpleZones[i].left / 100) * W,
              y: (simpleZones[i].top / 100) * H,
              width: (simpleZones[i].width / 100) * W,
              height: (simpleZones[i].height / 100) * H,
            },
          })
        }
        label="simple"
        style={{ border: "2px solid #00f", background: "rgba(0,0,255,0.2)" }}
      />

      {/* useZones */}
      <Rectangles<UseZone>
        selectedKey={selectedKey}
        onSelectKey={(key) => setSelectedKey(key)}
        items={useZones}
        getKey={(z) => `use-${z.id}`}
        getRect={(z) => ({
          x: (z.config.left / 100) * W,
          y: (z.config.top / 100) * H,
          w: (z.config.width / 100) * W,
          h: (z.config.height / 100) * H,
        })}
        onDragResize={(i, r) =>
          setUseZones((zs) =>
            zs.map((z, ii) =>
              ii === i
                ? {
                    ...z,
                    config: {
                      ...z.config,
                      left: parseFloat(((r.x / W) * 100).toFixed(1)),
                      top: parseFloat(((r.y / H) * 100).toFixed(1)),
                      width: parseFloat(((r.w / W) * 100).toFixed(1)),
                      height: parseFloat(((r.h / H) * 100).toFixed(1)),
                    },
                  }
                : z
            )
          )
        }
        onDoubleClick={(i) => {
          const z = useZones[i];
          setForm({
            mode: "useZone",
            index: i,
            rect: {
              id: "",
              x: (z.config.left / 100) * W,
              y: (z.config.top / 100) * H,
              width: (z.config.width / 100) * W,
              height: (z.config.height / 100) * H,
            },
            id: z.id,
            name: z.name,
            feedback: z.feedbackOnDrop,
            items: z.acceptedItems.join(","),
          });
        }}
        label="useZone"
        style={{
          border: "2px solid rgba(255,0,0,0.8)",
          background: "rgba(255,0,0,0.3)",
        }}
      />

      {/* arrElements */}
      <Rectangles<ArrElement>
        selectedKey={selectedKey}
        onSelectKey={(key) => setSelectedKey(key)}
        items={arrElements}
        getKey={(el) => `arr-${el.uniqueId}`}
        getRect={(el) => ({
          x: (el.left / 100) * W,
          y: (el.top / 100) * H,
          w: (el.width / 100) * W,
          h: (el.height / 100) * H,
        })}
        onDragResize={(i, r) =>
          setArrElements((els) =>
            els.map((el, ii) =>
              ii === i
                ? {
                    ...el,
                    left: parseFloat(((r.x / W) * 100).toFixed(1)),
                    top: parseFloat(((r.y / H) * 100).toFixed(1)),
                    width: parseFloat(((r.w / W) * 100).toFixed(1)),
                    height: parseFloat(((r.h / H) * 100).toFixed(1)),
                  }
                : el
            )
          )
        }
        onDoubleClick={(i) => {
          const el = arrElements[i];
          setForm({
            mode: "arrElement",
            index: i,
            rect: {
              id: "",
              x: (el.left / 100) * W,
              y: (el.top / 100) * H,
              width: (el.width / 100) * W,
              height: (el.height / 100) * H,
            },
            elId: el.id,
            elSrc: el.src,
            elText: el.text,
            fitMode: el.fitMode,
          });
        }}
        onItemFileDrop={(i, dataUrl) => {
          setArrElements((els) =>
            els.map((el, idx) =>
              idx === i
                ? {
                    ...el,
                    src: dataUrl, // aquí cambias el src a la cadena Base64
                  }
                : el
            )
          );
        }}
        label="arrElement"
        style={{ cursor: "move" }}
        renderContent={(el) => (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${el.src})`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              // si fitMode==="contain", mantiene proporción
              // si fitMode==="fill", estira a 100%×100%
              backgroundSize:
                el.fitMode === "contain" ? "contain" : "100% 100%",
            }}
          />
        )}
      />

      {/* hotspotToasts */}
      <Rectangles<HotspotToast>
        selectedKey={selectedKey}
        onSelectKey={(key) => setSelectedKey(key)}
        items={hotspotToasts}
        getKey={(_, i) => `toast-${i}`}
        getRect={(h) => ({
          x: (h.props.rect.left / 100) * W,
          y: (h.props.rect.top / 100) * H,
          w: (h.props.rect.width / 100) * W,
          h: (h.props.rect.height / 100) * H,
        })}
        onDragResize={(i, r) =>
          setHotspotToasts((hs) =>
            hs.map((h, ii) =>
              ii === i
                ? {
                    ...h,
                    props: {
                      ...h.props,
                      rect: {
                        top: parseFloat(((r.y / H) * 100).toFixed(1)),
                        left: parseFloat(((r.x / W) * 100).toFixed(1)),
                        width: parseFloat(((r.w / W) * 100).toFixed(1)),
                        height: parseFloat(((r.h / H) * 100).toFixed(1)),
                      },
                    },
                  }
                : h
            )
          )
        }
        onDoubleClick={(i) => {
          const h = hotspotToasts[i];
          setForm({
            mode: "hotspotToast",
            index: i,
            rect: {
              id: "",
              x: (h.props.rect.left / 100) * W,
              y: (h.props.rect.top / 100) * H,
              width: (h.props.rect.width / 100) * W,
              height: (h.props.rect.height / 100) * H,
            },
            content: h.props.content,
          });
        }}
        label="HotspotToast"
        style={{
          border: "2px dashed orange",
          background: "rgba(255,165,0,0.2)",
        }}
      />

      {form && (
        <EditForm
          form={form}
          onChange={(f) => setForm(f)}
          onSave={saveForm}
          onCancel={() => setForm(null)}
        />
      )}

      {/* controles */}
      <button
        onClick={exportJSON}
        style={{ position: "absolute", top: 10, right: 10, zIndex: 20 }}
      >
        Descargar JSON
      </button>
      <button
        onClick={clearAll}
        style={{
          position: "absolute",
          top: 50,
          right: 10,
          zIndex: 20,
          background: "#f44",
          color: "#fff",
          border: "none",
          padding: "6px 12px",
          cursor: "pointer",
        }}
      >
        Borrar Todo
      </button>
    </Canvas>
  );
}
