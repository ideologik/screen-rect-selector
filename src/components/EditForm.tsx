import React from "react";
import type { RectDraw } from "../types";

export interface EditingForm {
  mode: "simple" | "useZone" | "arrElement" | "hotspotToast";
  index: number;
  rect: RectDraw;
  // useZone
  id?: string;
  name?: string;
  feedback?: string;
  items?: string;
  // arrElement
  elId?: string;
  elSrc?: string;
  elText?: string;
  // hotspotToast
  content?: string;
}

interface EditFormProps {
  form: EditingForm;
  onChange(f: EditingForm): void;
  onSave(e: React.FormEvent): void;
  onCancel(): void;
}

export function EditForm({ form, onChange, onSave, onCancel }: EditFormProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: form.rect.y + form.rect.height + 8,
        left: form.rect.x,
        background: "#fff",
        padding: 12,
        border: "1px solid #333",
        zIndex: 999,
      }}
    >
      <form onSubmit={onSave}>
        <label>
          Tipo:{" "}
          <select
            value={form.mode}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onChange({
                ...form,
                mode: e.target.value as EditingForm["mode"],
              })
            }
          >
            <option value="simple">simple</option>
            <option value="useZone">useZone</option>
            <option value="arrElement">arrElement</option>
            <option value="hotspotToast">hotspotToast</option>
          </select>
        </label>

        <div style={{ marginTop: 8 }}>
          {form.mode === "useZone" && (
            <>
              <div>
                <label>
                  ID:{" "}
                  <input
                    required
                    value={form.id || ""}
                    onChange={(e) => onChange({ ...form, id: e.target.value })}
                  />
                </label>
              </div>
              <div>
                <label>
                  Name:{" "}
                  <input
                    required
                    value={form.name || ""}
                    onChange={(e) =>
                      onChange({ ...form, name: e.target.value })
                    }
                  />
                </label>
              </div>
              <div>
                <label>
                  Feedback:{" "}
                  <input
                    required
                    value={form.feedback || ""}
                    onChange={(e) =>
                      onChange({ ...form, feedback: e.target.value })
                    }
                  />
                </label>
              </div>
              <div>
                <label>
                  Items (coma sep):{" "}
                  <input
                    required
                    value={form.items || ""}
                    onChange={(e) =>
                      onChange({ ...form, items: e.target.value })
                    }
                  />
                </label>
              </div>
            </>
          )}

          {form.mode === "arrElement" && (
            <>
              <div>
                <label>
                  ID:{" "}
                  <input
                    required
                    value={form.elId || ""}
                    onChange={(e) =>
                      onChange({ ...form, elId: e.target.value })
                    }
                  />
                </label>
              </div>
              <div>
                <label>
                  Src:{" "}
                  <input
                    required
                    value={form.elSrc || ""}
                    onChange={(e) =>
                      onChange({ ...form, elSrc: e.target.value })
                    }
                  />
                </label>
              </div>
              <div>
                <label>
                  Text:{" "}
                  <input
                    required
                    value={form.elText || ""}
                    onChange={(e) =>
                      onChange({ ...form, elText: e.target.value })
                    }
                  />
                </label>
              </div>
            </>
          )}

          {form.mode === "hotspotToast" && (
            <div>
              <label>
                Content (HTML):
                <br />
                <textarea
                  rows={4}
                  style={{ width: "100%" }}
                  required
                  value={form.content || ""}
                  onChange={(e) =>
                    onChange({ ...form, content: e.target.value })
                  }
                />
              </label>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit">Guardar</button>{" "}
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
