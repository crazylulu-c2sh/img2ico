import { buildIcoFromPngChunks } from "../../../packages/core/src/index";
import "./style.css";

const fileInput = document.querySelector<HTMLInputElement>("#fileInput");
const sizesInput = document.querySelector<HTMLInputElement>("#sizesInput");
const convertButton = document.querySelector<HTMLButtonElement>("#convertButton");
const statusText = document.querySelector<HTMLParagraphElement>("#statusText");
const dropZone = document.querySelector<HTMLElement>("#dropZone");
const previewWrap = document.querySelector<HTMLElement>("#previewWrap");
const previewImage = document.querySelector<HTMLImageElement>("#previewImage");

if (!fileInput || !sizesInput || !convertButton || !statusText || !previewWrap || !previewImage) {
  throw new Error("필수 DOM 요소를 찾을 수 없습니다.");
}

const fileInputEl = fileInput;
const sizesInputEl = sizesInput;
const convertButtonEl = convertButton;
const statusParagraph = statusText;
const previewWrapEl = previewWrap;
const previewImageEl = previewImage;

let previewObjectUrl: string | null = null;

function setStatus(message: string): void {
  statusParagraph.textContent = message;
}

function revokePreviewUrl(): void {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
}

function syncSelectedFile(): void {
  const file = fileInputEl.files?.[0];
  if (!file) {
    revokePreviewUrl();
    previewImageEl.onerror = null;
    previewImageEl.removeAttribute("src");
    previewImageEl.alt = "";
    previewWrapEl.hidden = true;
    setStatus("");
    return;
  }

  revokePreviewUrl();
  previewObjectUrl = URL.createObjectURL(file);
  previewImageEl.alt = file.name;
  previewImageEl.onerror = () => {
    previewImageEl.onerror = null;
    revokePreviewUrl();
    previewImageEl.removeAttribute("src");
    previewWrapEl.hidden = true;
    setStatus(`선택됨: ${file.name} — 미리보기를 표시할 수 없습니다.`);
  };
  previewWrapEl.hidden = false;
  previewImageEl.src = previewObjectUrl;
  setStatus(`선택됨: ${file.name}`);
}

function parseSizes(raw: string): number[] {
  const sizes = raw
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value));

  if (sizes.length === 0) {
    throw new Error("해상도 목록을 입력하세요. 예: 16,32,48,256");
  }
  for (const size of sizes) {
    if (size < 1 || size > 256) {
      throw new Error(`지원하지 않는 크기(${size})입니다. 1~256 범위만 허용됩니다.`);
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

/**
 * createImageBitmap이 실패하는 일부 MIME/확장자는 <img> 로딩으로 재시도합니다.
 */
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
        img.onerror = () =>
          reject(
            new Error(
              "이 파일을 디코딩할 수 없습니다. 다른 브라우저를 쓰거나 CLI(Sharp)로 변환해 보세요."
            )
          );
        img.src = url;
      });
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      if (width === 0 || height === 0) {
        throw new Error("이미지 크기를 읽을 수 없습니다.");
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
      reject(new Error("PNG 변환에 실패했습니다."));
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
    throw new Error("Canvas 2D 컨텍스트를 만들 수 없습니다.");
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
      syncSelectedFile();
    }
  });
}

fileInputEl.addEventListener("change", () => {
  syncSelectedFile();
});

convertButtonEl.addEventListener("click", async () => {
  try {
    const file = fileInputEl.files?.[0];
    if (!file) {
      throw new Error("먼저 이미지를 선택하세요.");
    }
    setStatus("변환 중...");
    const sizes = parseSizes(sizesInputEl.value);
    const decoded = await decodeImageFile(file);
    try {
      const chunks = await Promise.all(sizes.map((size) => buildPngChunkFromDecoded(decoded, size)));
      const ico = buildIcoFromPngChunks(chunks);
      const outputName = `${file.name.replace(/\.[^/.]+$/, "") || "favicon"}.ico`;
      triggerDownload(ico, outputName);
      setStatus(`완료: ${outputName}`);
    } finally {
      decoded.dispose();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    setStatus(`실패: ${message}`);
  }
});
