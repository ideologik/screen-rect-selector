// --- Tipos principales ---
export type SimpleZone = {
  top: number;
  left: number;
  width: number;
  height: number;
};
export type UseZone = {
  id: string;
  name: string;
  feedbackOnDrop: string;
  config: {
    top: number;
    left: number;
    width: number;
    height: number;
    zIndex: number;
    backgroundColor: string;
  };
  acceptedItems: string[];
};
export type ArrElement = {
  uniqueId: string;
  id: string;
  type: string;
  text: string;
  hovered: boolean;
  typeElement: string;
  top: number;
  left: number;
  width: number;
  height: number;
  order: number;
  src: string;
  state: string;
  animationType: string;
  animation: string;
  fitMode: "contain" | "fill";
};
export type HotspotToast = {
  component: "HotspotToast";
  props: {
    rect: { top: number; left: number; width: number; height: number };
    content: string;
  };
};
export type RectDraw = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
