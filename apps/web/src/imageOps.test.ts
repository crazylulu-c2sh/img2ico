import { describe, expect, it } from "vitest";
import {
  colorMatchMaxChannel,
  edgeFloodBackground,
  foregroundBounds,
  padBounds,
  padRectRgbaToSquareBuffer,
  sampleCornerSeedRgb
} from "./imageOps";

describe("colorMatchMaxChannel", () => {
  it("matches within tolerance per channel", () => {
    const seed = { r: 100, g: 100, b: 100 };
    expect(colorMatchMaxChannel(105, 98, 100, seed, 5)).toBe(true);
    expect(colorMatchMaxChannel(106, 100, 100, seed, 5)).toBe(false);
  });
});

describe("sampleCornerSeedRgb", () => {
  it("averages four corners", () => {
    const w = 3;
    const h = 3;
    const data = new Uint8ClampedArray(w * h * 4);
    const set = (x: number, y: number, r: number, g: number, b: number) => {
      const i = (y * w + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    };
    set(0, 0, 0, 0, 0);
    set(2, 0, 10, 0, 0);
    set(0, 2, 0, 10, 0);
    set(2, 2, 0, 0, 10);
    const s = sampleCornerSeedRgb(data, w, h);
    expect(s.r).toBe(3);
    expect(s.g).toBe(3);
    expect(s.b).toBe(3);
  });
});

describe("edgeFloodBackground", () => {
  it("clears edge-connected matching color", () => {
    const w = 5;
    const h = 5;
    const data = new Uint8ClampedArray(w * h * 4).fill(255);
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const i = (y * w + x) * 4;
        if (x === 2 && y === 2) {
          data[i] = 255;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 255;
        }
      }
    }
    const seed = { r: 255, g: 255, b: 255 };
    edgeFloodBackground(data, w, h, seed, 0, 128, true);
    const center = (2 * w + 2) * 4;
    expect(data[center + 3]).toBe(255);
    expect(data[center + 1]).toBe(0);
    const outer = (0 * w + 0) * 4;
    expect(data[outer + 3]).toBe(0);
  });
});

describe("foregroundBounds", () => {
  it("returns null when empty", () => {
    const w = 2;
    const h = 2;
    const data = new Uint8ClampedArray(w * h * 4);
    expect(foregroundBounds(data, w, h, null, 16)).toBeNull();
  });

  it("finds tight box for opaque pixels", () => {
    const w = 4;
    const h = 4;
    const data = new Uint8ClampedArray(w * h * 4);
    const i = (1 * w + 1) * 4;
    data[i + 3] = 255;
    const b = foregroundBounds(data, w, h, null, 16);
    expect(b).toEqual({ x: 1, y: 1, w: 1, h: 1 });
  });
});

describe("padBounds", () => {
  it("clamps to image rect", () => {
    const b = padBounds({ x: 1, y: 1, w: 2, h: 2 }, 10, 4, 4);
    expect(b).toEqual({ x: 0, y: 0, w: 4, h: 4 });
  });
});

describe("padRectRgbaToSquareBuffer", () => {
  it("pads 2x1 to 2x2 with transparent bottom row", () => {
    const w = 2;
    const h = 1;
    const data = new Uint8ClampedArray(w * h * 4);
    data[3] = 255;
    data[7] = 255;
    const { buffer, side } = padRectRgbaToSquareBuffer(data, w, h);
    expect(side).toBe(2);
    expect(buffer.length).toBe(16);
    expect(buffer[3]).toBe(255);
    expect(buffer[7]).toBe(255);
    const bottomLeftAlpha = (1 * 2 + 0) * 4 + 3;
    expect(buffer[bottomLeftAlpha]).toBe(0);
  });

  it("returns same dimensions when already square", () => {
    const data = new Uint8ClampedArray(4).fill(128);
    data[3] = 255;
    const { buffer, side } = padRectRgbaToSquareBuffer(data, 1, 1);
    expect(side).toBe(1);
    expect(buffer[0]).toBe(128);
  });
});
