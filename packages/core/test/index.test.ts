import { describe, expect, it } from "vitest";
import { buildIcoFromPngChunks } from "../src/index";

function createPng(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(8 + 4 + 4 + 13 + 4 + 12);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes.set([0x00, 0x00, 0x00, 0x0d], 8);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  bytes.set([(width >>> 24) & 0xff, (width >>> 16) & 0xff, (width >>> 8) & 0xff, width & 0xff], 16);
  bytes.set(
    [(height >>> 24) & 0xff, (height >>> 16) & 0xff, (height >>> 8) & 0xff, height & 0xff],
    20
  );
  bytes.set([8, 6, 0, 0, 0], 24);
  bytes.set([0, 0, 0, 0], 29);
  bytes.set([0, 0, 0, 0], 33);
  bytes.set([0x49, 0x45, 0x4e, 0x44], 37);
  bytes.set([0xae, 0x42, 0x60, 0x82], 41);
  return bytes;
}

describe("buildIcoFromPngChunks", () => {
  it("creates ICO with valid directory and entries", () => {
    const png16 = createPng(16, 16);
    const png256 = createPng(256, 256);
    const ico = buildIcoFromPngChunks([png16, png256]);
    const view = new DataView(ico.buffer);

    expect(view.getUint16(0, true)).toBe(0);
    expect(view.getUint16(2, true)).toBe(1);
    expect(view.getUint16(4, true)).toBe(2);

    const firstEntry = 6;
    expect(ico[firstEntry]).toBe(16);
    expect(ico[firstEntry + 1]).toBe(16);
    expect(view.getUint32(firstEntry + 8, true)).toBe(png16.length);
    expect(view.getUint32(firstEntry + 12, true)).toBe(38);

    const secondEntry = 22;
    expect(ico[secondEntry]).toBe(0);
    expect(ico[secondEntry + 1]).toBe(0);
    expect(view.getUint32(secondEntry + 8, true)).toBe(png256.length);
    expect(view.getUint32(secondEntry + 12, true)).toBe(38 + png16.length);
  });

  it("throws for invalid png input", () => {
    expect(() => buildIcoFromPngChunks([new Uint8Array([1, 2, 3])])).toThrowError();
  });
});
