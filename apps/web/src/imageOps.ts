export type Rgb = { r: number; g: number; b: number };

export type Bounds = { x: number; y: number; w: number; h: number };

export const DEFAULT_MAX_PROCESSING_DIMENSION = 4096;

export function colorMatchMaxChannel(
  r: number,
  g: number,
  b: number,
  seed: Rgb,
  tolerance: number
): boolean {
  return (
    Math.abs(r - seed.r) <= tolerance &&
    Math.abs(g - seed.g) <= tolerance &&
    Math.abs(b - seed.b) <= tolerance
  );
}

export function sampleCornerSeedRgb(data: Uint8ClampedArray, width: number, height: number): Rgb {
  const idx = (x: number, y: number) => (y * width + x) * 4;
  const corners: Rgb[] = [
    { r: data[idx(0, 0)], g: data[idx(0, 0) + 1], b: data[idx(0, 0) + 2] },
    { r: data[idx(width - 1, 0)], g: data[idx(width - 1, 0) + 1], b: data[idx(width - 1, 0) + 2] },
    { r: data[idx(0, height - 1)], g: data[idx(0, height - 1) + 1], b: data[idx(0, height - 1) + 2] },
    {
      r: data[idx(width - 1, height - 1)],
      g: data[idx(width - 1, height - 1) + 1],
      b: data[idx(width - 1, height - 1) + 2]
    }
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const c of corners) {
    r += c.r;
    g += c.g;
    b += c.b;
  }
  return {
    r: Math.round(r / corners.length),
    g: Math.round(g / corners.length),
    b: Math.round(b / corners.length)
  };
}

export function edgeFloodBackground(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  seed: Rgb,
  tolerance: number,
  minAlphaForMatch: number,
  clearMatched: boolean
): Uint8Array {
  const isBg = new Uint8Array(width * height);
  const inQueue = new Uint8Array(width * height);
  const q: number[] = [];

  const pushIdx = (idx: number): void => {
    if (inQueue[idx]) {
      return;
    }
    inQueue[idx] = 1;
    q.push(idx);
  };

  for (let x = 0; x < width; x += 1) {
    pushIdx(x);
    pushIdx((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    pushIdx(y * width);
    pushIdx(y * width + (width - 1));
  }

  let head = 0;
  while (head < q.length) {
    const idx = q[head]!;
    head += 1;
    const i = idx * 4;
    const a = data[i + 3];
    if (a < minAlphaForMatch) {
      continue;
    }
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (!colorMatchMaxChannel(r, g, b, seed, tolerance)) {
      continue;
    }
    isBg[idx] = 1;
    if (clearMatched) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
    const x = idx % width;
    const y = (idx / width) | 0;
    if (x > 0) {
      pushIdx(idx - 1);
    }
    if (x + 1 < width) {
      pushIdx(idx + 1);
    }
    if (y > 0) {
      pushIdx(idx - width);
    }
    if (y + 1 < height) {
      pushIdx(idx + width);
    }
  }

  return isBg;
}

export function foregroundBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  isBg: Uint8Array | null,
  alphaMin: number
): Bounds | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      const i = idx * 4;
      if (data[i + 3] <= alphaMin) {
        continue;
      }
      if (isBg && isBg[idx]) {
        continue;
      }
      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
    }
  }
  if (maxX < minX) {
    return null;
  }
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

export function padBounds(bounds: Bounds, padPx: number, width: number, height: number): Bounds {
  const p = Math.max(0, Math.floor(padPx));
  const x = Math.max(0, bounds.x - p);
  const y = Math.max(0, bounds.y - p);
  const x2 = Math.min(width, bounds.x + bounds.w + p);
  const y2 = Math.min(height, bounds.y + bounds.h + p);
  return { x, y, w: Math.max(1, x2 - x), h: Math.max(1, y2 - y) };
}

export function copyImageDataRegion(
  sourceData: Uint8ClampedArray,
  sw: number,
  bounds: Bounds
): ImageData {
  const { x, y, w, h } = bounds;
  const out = new ImageData(w, h);
  for (let row = 0; row < h; row += 1) {
    const srcRow = (y + row) * sw + x;
    const dstRow = row * w;
    for (let col = 0; col < w; col += 1) {
      const si = (srcRow + col) * 4;
      const di = (dstRow + col) * 4;
      out.data[di] = sourceData[si]!;
      out.data[di + 1] = sourceData[si + 1]!;
      out.data[di + 2] = sourceData[si + 2]!;
      out.data[di + 3] = sourceData[si + 3]!;
    }
  }
  return out;
}

/**
 * 직사각형 RGBA를 투명 패딩으로 정사각(side=max(w,h)) 버퍼에 넣고 중앙 정렬합니다(테스트·브라우저 공용).
 */
export function padRectRgbaToSquareBuffer(
  data: Uint8ClampedArray,
  width: number,
  height: number
): { buffer: Uint8ClampedArray; side: number } {
  if (width === height) {
    return { buffer: new Uint8ClampedArray(data), side: width };
  }
  const side = Math.max(width, height);
  const out = new Uint8ClampedArray(side * side * 4);
  const ox = Math.floor((side - width) / 2);
  const oy = Math.floor((side - height) / 2);
  for (let row = 0; row < height; row += 1) {
    const srcStart = row * width * 4;
    const dstStart = ((oy + row) * side + ox) * 4;
    out.set(data.subarray(srcStart, srcStart + width * 4), dstStart);
  }
  return { buffer: out, side };
}

/**
 * 직사각형 RGBA 버퍼를 투명 패딩으로 정사각(side=max(w,h))에 넣고 중앙 정렬합니다.
 */
export function padRectRgbaToSquare(data: Uint8ClampedArray, width: number, height: number): ImageData {
  const { buffer, side } = padRectRgbaToSquareBuffer(data, width, height);
  return new ImageData(buffer, side, side);
}

export function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D 컨텍스트를 만들 수 없습니다.");
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function scaleCanvas(source: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  if (scale === 1 || !Number.isFinite(scale)) {
    return source;
  }
  const w = Math.max(1, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D 컨텍스트를 만들 수 없습니다.");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, w, h);
  return canvas;
}

export type RasterEditOptions = {
  transparentEnabled: boolean;
  seedManual: boolean;
  seedRgb: Rgb | null;
  tolerance: number;
  minAlphaForMatch: number;
  cropEnabled: boolean;
  paddingPx: number;
  scale: number;
};

export function applyRasterEdits(sourceCanvas: HTMLCanvasElement, options: RasterEditOptions): HTMLCanvasElement {
  const sw = sourceCanvas.width;
  const sh = sourceCanvas.height;
  const ctx0 = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx0) {
    throw new Error("Canvas 2D 컨텍스트를 읽을 수 없습니다.");
  }

  if (!options.transparentEnabled && !options.cropEnabled) {
    const clone = document.createElement("canvas");
    clone.width = sw;
    clone.height = sh;
    const cctx = clone.getContext("2d");
    if (!cctx) {
      throw new Error("Canvas 2D 컨텍스트를 만들 수 없습니다.");
    }
    cctx.drawImage(sourceCanvas, 0, 0);
    if (options.scale !== 1 && Number.isFinite(options.scale)) {
      return scaleCanvas(clone, options.scale);
    }
    return clone;
  }

  const src = ctx0.getImageData(0, 0, sw, sh);
  const data = new Uint8ClampedArray(src.data);
  const seed =
    options.seedManual && options.seedRgb
      ? options.seedRgb
      : sampleCornerSeedRgb(data, sw, sh);

  const isBg = edgeFloodBackground(
    data,
    sw,
    sh,
    seed,
    options.tolerance,
    options.minAlphaForMatch,
    options.transparentEnabled
  );

  let workW = sw;
  let workH = sh;
  let workData = data;

  if (options.cropEnabled) {
    const alphaMin = 16;
    const bounds = foregroundBounds(data, sw, sh, options.transparentEnabled ? null : isBg, alphaMin);
    if (bounds) {
      const padded = padBounds(bounds, options.paddingPx, sw, sh);
      const cropped = copyImageDataRegion(data, sw, padded);
      workData = cropped.data;
      workW = cropped.width;
      workH = cropped.height;
    }
    if (workW !== workH) {
      const { buffer, side } = padRectRgbaToSquareBuffer(workData, workW, workH);
      workData = buffer;
      workW = side;
      workH = side;
    }
  }

  let canvas = imageDataToCanvas(new ImageData(workData, workW, workH));
  if (options.scale !== 1 && Number.isFinite(options.scale)) {
    canvas = scaleCanvas(canvas, options.scale);
  }
  return canvas;
}

export function rasterizeToMaxDimension(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, dw: number, dh: number) => void,
  maxDim: number
): HTMLCanvasElement {
  let dw = width;
  let dh = height;
  const maxSide = Math.max(width, height);
  if (maxSide > maxDim) {
    const s = maxDim / maxSide;
    dw = Math.max(1, Math.round(width * s));
    dh = Math.max(1, Math.round(height * s));
  }
  const canvas = document.createElement("canvas");
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D 컨텍스트를 만들 수 없습니다.");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  draw(ctx, dw, dh);
  return canvas;
}
