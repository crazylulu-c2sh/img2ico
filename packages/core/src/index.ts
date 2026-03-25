const PNG_SIGNATURE = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]);

const IHDR_CHUNK_TYPE = 0x49484452;
const ICONDIR_SIZE = 6;
const ICONDIRENTRY_SIZE = 16;

export type IcoImageEntry = {
  width: number;
  height: number;
  data: Uint8Array;
};

function readU32BE(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

function writeU16LE(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function writeU32LE(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true);
}

function isPng(data: Uint8Array): boolean {
  if (data.length < PNG_SIGNATURE.length) {
    return false;
  }
  for (let i = 0; i < PNG_SIGNATURE.length; i += 1) {
    if (data[i] !== PNG_SIGNATURE[i]) {
      return false;
    }
  }
  return true;
}

function parsePngSize(data: Uint8Array): { width: number; height: number } {
  if (!isPng(data)) {
    throw new Error("입력 데이터가 유효한 PNG가 아닙니다.");
  }
  if (data.length < 33) {
    throw new Error("PNG 데이터가 너무 짧습니다.");
  }

  const ihdrLength = readU32BE(data, 8);
  const ihdrType = readU32BE(data, 12);
  if (ihdrType !== IHDR_CHUNK_TYPE || ihdrLength !== 13) {
    throw new Error("PNG IHDR 헤더를 찾을 수 없습니다.");
  }

  const width = readU32BE(data, 16);
  const height = readU32BE(data, 20);
  if (width === 0 || height === 0 || width > 256 || height > 256) {
    throw new Error("ICO에 넣을 PNG 크기는 1~256 범위여야 합니다.");
  }

  return { width, height };
}

export function buildIcoFromPngChunks(chunks: Uint8Array[]): Uint8Array {
  if (chunks.length === 0) {
    throw new Error("최소 1개 이상의 PNG 청크가 필요합니다.");
  }
  if (chunks.length > 65535) {
    throw new Error("아이콘 엔트리 수가 너무 많습니다.");
  }

  const entries: IcoImageEntry[] = chunks.map((data) => {
    const { width, height } = parsePngSize(data);
    return { width, height, data };
  });

  const directorySize = ICONDIR_SIZE + ICONDIRENTRY_SIZE * entries.length;
  const imageBytesSize = entries.reduce((acc, entry) => acc + entry.data.length, 0);
  const output = new Uint8Array(directorySize + imageBytesSize);
  const view = new DataView(output.buffer);

  writeU16LE(view, 0, 0);
  writeU16LE(view, 2, 1);
  writeU16LE(view, 4, entries.length);

  let dataOffset = directorySize;
  entries.forEach((entry, index) => {
    const base = ICONDIR_SIZE + index * ICONDIRENTRY_SIZE;
    output[base] = entry.width === 256 ? 0 : entry.width;
    output[base + 1] = entry.height === 256 ? 0 : entry.height;
    output[base + 2] = 0;
    output[base + 3] = 0;
    writeU16LE(view, base + 4, 1);
    writeU16LE(view, base + 6, 32);
    writeU32LE(view, base + 8, entry.data.length);
    writeU32LE(view, base + 12, dataOffset);
    output.set(entry.data, dataOffset);
    dataOffset += entry.data.length;
  });

  return output;
}
