import { buildIcoFromPngChunks } from "../../../packages/core/src/index";
import {
  applyRasterEdits,
  DEFAULT_MAX_PROCESSING_DIMENSION,
  rasterizeToMaxDimension,
  type RasterEditOptions,
  type Rgb
} from "./imageOps";
import { initI18n, onLocaleChange, t } from "./i18n";
import "./style.css";

type StatusModel =
  | { kind: "empty" }
  | { kind: "i18n"; key: string; vars?: Record<string, string | number> };

let statusModel: StatusModel = { kind: "empty" };

function nn<T extends HTMLElement>(el: T | null, label: string): T {
  if (!el) {
    throw new Error(t("errors.missingDom", { label }));
  }
  return el;
}

const fileInputEl = nn(document.querySelector<HTMLInputElement>("#fileInput"), "fileInput");
const sizesInputEl = nn(document.querySelector<HTMLInputElement>("#sizesInput"), "sizesInput");
const convertButtonEl = nn(document.querySelector<HTMLButtonElement>("#convertButton"), "convertButton");
const statusParagraph = nn(document.querySelector<HTMLParagraphElement>("#statusText"), "statusText");

function paintStatus(): void {
  if (statusModel.kind === "empty") {
    statusParagraph.textContent = "";
    return;
  }
  statusParagraph.textContent = t(statusModel.key, statusModel.vars);
}

function setStatusMessage(key: string, vars?: Record<string, string | number>): void {
  statusModel = { kind: "i18n", key, vars };
  paintStatus();
}

function clearStatus(): void {
  statusModel = { kind: "empty" };
  paintStatus();
}

const dropZone = document.querySelector<HTMLElement>("#dropZone");
const previewWrapEl = nn(document.querySelector<HTMLElement>("#previewWrap"), "previewWrap");
const previewCanvasEl = nn(document.querySelector<HTMLCanvasElement>("#previewCanvas"), "previewCanvas");
const transparentEnabledEl = nn(
  document.querySelector<HTMLInputElement>("#transparentEnabled"),
  "transparentEnabled"
);
const seedAutoEl = nn(document.querySelector<HTMLInputElement>("#seedAuto"), "seedAuto");
const seedManualEl = nn(document.querySelector<HTMLInputElement>("#seedManual"), "seedManual");
const seedColorEl = nn(document.querySelector<HTMLInputElement>("#seedColor"), "seedColor");
const toleranceEl = nn(document.querySelector<HTMLInputElement>("#tolerance"), "tolerance");
const toleranceOut = nn(document.querySelector<HTMLOutputElement>("#toleranceOut"), "toleranceOut");
const minAlphaForMatchEl = nn(
  document.querySelector<HTMLInputElement>("#minAlphaForMatch"),
  "minAlphaForMatch"
);
const minAlphaOut = nn(document.querySelector<HTMLOutputElement>("#minAlphaOut"), "minAlphaOut");
const cropEnabledEl = nn(document.querySelector<HTMLInputElement>("#cropEnabled"), "cropEnabled");
const paddingPxEl = nn(document.querySelector<HTMLInputElement>("#paddingPx"), "paddingPx");
const scalePercentEl = nn(document.querySelector<HTMLInputElement>("#scalePercent"), "scalePercent");
const scaleOut = nn(document.querySelector<HTMLOutputElement>("#scaleOut"), "scaleOut");

initI18n();
onLocaleChange(() => {
  paintStatus();
});

let sourceRasterCanvas: HTMLCanvasElement | null = null;
let loadGeneration = 0;
let previewDebounceTimer: number | null = null;
let immediatePreviewQueued = false;
const EDIT_PREVIEW_DEBOUNCE_MS = 45;
const PREVIEW_CANVAS_SIDE = 280;

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace("#", "").trim();
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const n = Number.parseInt(expanded, 16);
  if (!Number.isFinite(n) || expanded.length !== 6) {
    return { r: 255, g: 255, b: 255 };
  }
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function readEditOptions(): RasterEditOptions {
  const transparentEnabled = transparentEnabledEl.checked;
  const seedManual = seedManualEl.checked;
  const seedRgb = seedManual ? hexToRgb(seedColorEl.value) : null;
  const tolerance = Number.parseInt(toleranceEl.value, 10);
  const minAlphaForMatch = Number.parseInt(minAlphaForMatchEl.value, 10);
  const cropEnabled = cropEnabledEl.checked;
  const paddingPx = Number.parseInt(paddingPxEl.value, 10);
  const scalePct = Number.parseInt(scalePercentEl.value, 10);
  return {
    transparentEnabled,
    seedManual,
    seedRgb,
    tolerance: Number.isFinite(tolerance) ? tolerance : 32,
    minAlphaForMatch: Number.isFinite(minAlphaForMatch) ? Math.min(255, Math.max(1, minAlphaForMatch)) : 128,
    cropEnabled,
    paddingPx: Number.isFinite(paddingPx) ? Math.min(256, Math.max(0, paddingPx)) : 0,
    scale: Math.min(2, Math.max(0.5, (Number.isFinite(scalePct) ? scalePct : 100) / 100))
  };
}

function syncSeedColorEnabled(): void {
  seedColorEl.disabled = seedAutoEl.checked;
}

function syncRangeOutputs(): void {
  toleranceOut.textContent = toleranceEl.value;
  minAlphaOut.textContent = minAlphaForMatchEl.value;
  scaleOut.textContent = scalePercentEl.value;
}

function cancelScheduledPreview(): void {
  if (previewDebounceTimer !== null) {
    window.clearTimeout(previewDebounceTimer);
    previewDebounceTimer = null;
  }
}

function schedulePreviewNow(): void {
  cancelScheduledPreview();
  // input/change가 같은 틱에 연달아 발생해도 프리뷰는 한 번만 그린다.
  if (immediatePreviewQueued) {
    return;
  }
  immediatePreviewQueued = true;
  queueMicrotask(() => {
    immediatePreviewQueued = false;
    runPreview();
  });
}

function schedulePreviewDebounced(): void {
  cancelScheduledPreview();
  previewDebounceTimer = window.setTimeout(() => {
    previewDebounceTimer = null;
    runPreview();
  }, EDIT_PREVIEW_DEBOUNCE_MS);
}

function schedulePreviewFromEdit(mode: "immediate" | "debounced"): void {
  if (mode === "immediate") {
    schedulePreviewNow();
    return;
  }
  schedulePreviewDebounced();
}

function schedulePreviewAfterSourceLoad(): void {
  schedulePreviewNow();
}

function runPreview(): void {
  if (!sourceRasterCanvas) {
    return;
  }
  const opts = readEditOptions();
  const out = applyRasterEdits(sourceRasterCanvas, opts);
  const rw = out.width;
  const rh = out.height;
  const basePreviewScale = Math.min(
    1,
    PREVIEW_CANVAS_SIDE / Math.max(sourceRasterCanvas.width, sourceRasterCanvas.height)
  );
  const dw = Math.max(1, Math.round(rw * basePreviewScale));
  const dh = Math.max(1, Math.round(rh * basePreviewScale));
  previewCanvasEl.width = PREVIEW_CANVAS_SIDE;
  previewCanvasEl.height = PREVIEW_CANVAS_SIDE;
  const ctx = previewCanvasEl.getContext("2d");
  if (!ctx) {
    return;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, PREVIEW_CANVAS_SIDE, PREVIEW_CANVAS_SIDE);
  const dx = Math.floor((PREVIEW_CANVAS_SIDE - dw) / 2);
  const dy = Math.floor((PREVIEW_CANVAS_SIDE - dh) / 2);
  ctx.drawImage(out, 0, 0, rw, rh, dx, dy, dw, dh);
}

type LoadRasterResult =
  | { ok: true; wasDownscaled: boolean }
  | { ok: false };

async function loadRasterSource(file: File): Promise<LoadRasterResult> {
  const generation = (loadGeneration += 1);
  const decoded = await decodeImageFile(file);
  const originalMax = Math.max(decoded.width, decoded.height);
  let canvas: HTMLCanvasElement;
  try {
    canvas = rasterizeToMaxDimension(
      decoded.width,
      decoded.height,
      (ctx, dw, dh) => {
        decoded.draw(ctx, 0, 0, dw, dh);
      },
      DEFAULT_MAX_PROCESSING_DIMENSION
    );
  } finally {
    decoded.dispose();
  }
  if (generation !== loadGeneration) {
    return { ok: false };
  }
  sourceRasterCanvas = canvas;
  return { ok: true, wasDownscaled: originalMax > DEFAULT_MAX_PROCESSING_DIMENSION };
}

async function onFileSelectionChanged(): Promise<void> {
  const file = fileInputEl.files?.[0];
  if (!file) {
    loadGeneration += 1;
    sourceRasterCanvas = null;
    previewWrapEl.hidden = true;
    clearStatus();
    return;
  }

  previewWrapEl.hidden = true;
  setStatusMessage("status.processing");
  try {
    const loaded = await loadRasterSource(file);
    if (!loaded.ok) {
      return;
    }
    previewWrapEl.hidden = false;
    syncRangeOutputs();
    syncSeedColorEnabled();
    schedulePreviewAfterSourceLoad();
    const note = loaded.wasDownscaled ? t("status.downscaledNote") : "";
    setStatusMessage("status.selected", { name: file.name, note });
  } catch (error) {
    sourceRasterCanvas = null;
    previewWrapEl.hidden = true;
    const message = error instanceof Error ? error.message : t("errors.unknown");
    setStatusMessage("status.loadFailed", { name: file.name, message });
  }
}

function parseSizes(raw: string): number[] {
  const sizes = raw
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value));

  if (sizes.length === 0) {
    throw new Error(t("errors.sizesEmpty"));
  }
  for (const size of sizes) {
    if (size < 1 || size > 256) {
      throw new Error(t("errors.sizeRange", { size }));
    }
  }
  return Array.from(new Set(sizes));
}

type DecodedImage = {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, dx: number, dy: number, dw: number, dh: number) => void;
  dispose: () => void;
};

async function decodeImageFile(file: File): Promise<DecodedImage> {
  try {
    const bitmap = await createImageBitmap(file);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw(ctx, dx, dy, dw, dh) {
        ctx.drawImage(bitmap, dx, dy, dw, dh);
      },
      dispose() {
        bitmap.close();
      }
    };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = "async";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(t("errors.decodeFile")));
        img.src = url;
      });
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      if (width === 0 || height === 0) {
        throw new Error(t("errors.imageSizeRead"));
      }
      return {
        width,
        height,
        draw(ctx, dx, dy, dw, dh) {
          ctx.drawImage(img, dx, dy, dw, dh);
        },
        dispose() {}
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
        return;
      }
      reject(new Error(t("errors.pngConvert")));
    }, "image/png");
  });

  const arr = await blob.arrayBuffer();
  return new Uint8Array(arr);
}

async function buildPngChunkFromDecoded(source: DecodedImage, size: number): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error(t("errors.canvas2d"));
  }

  const scale = Math.min(size / source.width, size / source.height);
  const drawWidth = Math.max(1, Math.round(source.width * scale));
  const drawHeight = Math.max(1, Math.round(source.height * scale));
  const dx = Math.floor((size - drawWidth) / 2);
  const dy = Math.floor((size - drawHeight) / 2);
  ctx.clearRect(0, 0, size, size);
  source.draw(ctx, dx, dy, drawWidth, drawHeight);

  return canvasToPngBytes(canvas);
}

function triggerDownload(data: Uint8Array, filename: string): void {
  const blob = new Blob([new Uint8Array(data)], { type: "image/x-icon" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function assignFileToInput(file: File): void {
  const dt = new DataTransfer();
  dt.items.add(file);
  fileInputEl.files = dt.files;
}

if (dropZone) {
  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });
  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragover");
    const file = event.dataTransfer?.files[0];
    if (file) {
      assignFileToInput(file);
      void onFileSelectionChanged();
    }
  });
}

fileInputEl.addEventListener("change", () => {
  void onFileSelectionChanged();
});

function onEditControlChanged(mode: "immediate" | "debounced"): void {
  syncRangeOutputs();
  syncSeedColorEnabled();
  schedulePreviewFromEdit(mode);
}

const continuousEditControls = [toleranceEl, minAlphaForMatchEl, paddingPxEl, scalePercentEl];
const immediateEditControls = [transparentEnabledEl, seedAutoEl, seedManualEl, seedColorEl, cropEnabledEl];

for (const el of continuousEditControls) {
  el.addEventListener("input", () => {
    onEditControlChanged("debounced");
  });
  el.addEventListener("change", () => {
    onEditControlChanged("immediate");
  });
}

for (const el of immediateEditControls) {
  el.addEventListener("input", () => {
    onEditControlChanged("immediate");
  });
  el.addEventListener("change", () => {
    onEditControlChanged("immediate");
  });
}

convertButtonEl.addEventListener("click", async () => {
  try {
    if (!sourceRasterCanvas) {
      throw new Error(t("errors.pickImage"));
    }
    const file = fileInputEl.files?.[0];
    if (!file) {
      throw new Error(t("errors.pickImage"));
    }
    setStatusMessage("status.converting");
    const sizes = parseSizes(sizesInputEl.value);
    const opts = readEditOptions();
    const editedCanvas = applyRasterEdits(sourceRasterCanvas, opts);
    const decodedFromEdit: DecodedImage = {
      width: editedCanvas.width,
      height: editedCanvas.height,
      draw(ctx, dx, dy, dw, dh) {
        ctx.drawImage(editedCanvas, dx, dy, dw, dh);
      },
      dispose() {}
    };
    try {
      const chunks = await Promise.all(sizes.map((size) => buildPngChunkFromDecoded(decodedFromEdit, size)));
      const ico = buildIcoFromPngChunks(chunks);
      const outputName = `${file.name.replace(/\.[^/.]+$/, "") || "favicon"}.ico`;
      triggerDownload(ico, outputName);
      setStatusMessage("status.done", { name: outputName });
    } finally {
      decodedFromEdit.dispose();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : t("errors.unknown");
    setStatusMessage("status.failed", { message });
  }
});

previewWrapEl.hidden = true;
syncSeedColorEnabled();
syncRangeOutputs();
