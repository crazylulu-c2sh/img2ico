#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { stdin } from "node:process";
import { Command } from "commander";
import sharp from "sharp";
import { buildIcoFromPngChunks } from "@img2ico/core";

export const DEFAULT_SIZES = [16, 32, 48, 256];

/** Sharp(libvips)에 넘기는 공통 옵션: 애니 GIF·다중 프레임은 첫 프레임만, 손상 데이터는 가능한 한 디코드 */
const SHARP_INPUT_OPTIONS = { animated: false, failOn: "none" as const };

export function parseSizes(raw: string): number[] {
  const sizes = raw
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value));

  if (sizes.length === 0) {
    throw new Error("크기 목록이 비어 있습니다. 예: --sizes 16,32,48,256");
  }
  for (const size of sizes) {
    if (size < 1 || size > 256) {
      throw new Error(`지원하지 않는 크기(${size})입니다. 1~256 범위만 허용됩니다.`);
    }
  }
  return Array.from(new Set(sizes));
}

export function getDefaultOutputPath(input: string): string {
  if (input === "-") {
    return resolve(process.cwd(), "favicon.ico");
  }
  const ext = extname(input);
  const name = basename(input, ext);
  return resolve(process.cwd(), `${name}.ico`);
}

async function readStdinBuffer(): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) {
    throw new Error("표준 입력에 이미지 데이터가 없습니다.");
  }
  return Buffer.concat(chunks);
}

export async function openSharpInput(input: string): Promise<ReturnType<typeof sharp>> {
  if (input === "-") {
    const buffer = await readStdinBuffer();
    return sharp(buffer, SHARP_INPUT_OPTIONS).rotate();
  }
  return sharp(input, SHARP_INPUT_OPTIONS).rotate();
}

export async function run(inputPath: string, outputPath: string, sizes: number[]): Promise<void> {
  const source = await openSharpInput(inputPath);
  const chunks = await Promise.all(
    sizes.map(async (size) =>
      source
        .clone()
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer()
    )
  );

  const ico = buildIcoFromPngChunks(chunks.map((buffer) => new Uint8Array(buffer)));
  await writeFile(outputPath, ico);
}

export function createProgram(): Command {
  const program = new Command();
  program
    .name("img2ico")
    .description(
      "이미지를 파비콘용 멀티 해상도 ICO로 변환합니다. 입력은 Sharp(libvips)가 디코드하는 대부분의 래스터·벡터(SVG) 이미지를 지원하며, HEIF/HEIC·RAW·PDF 등은 설치된 libvips 빌드에 따라 달라질 수 있습니다."
    )
    .argument("<input>", "입력 파일 경로, 또는 표준 입력을 쓰려면 - (예: cat a.webp | img2ico - -o out.ico)")
    .option("-o, --output <path>", "출력 ico 파일 경로")
    .option("-s, --sizes <list>", "출력 해상도 목록(쉼표 구분)", DEFAULT_SIZES.join(","))
    .action(async (input: string, options: { output?: string; sizes: string }) => {
      const output = options.output ? resolve(process.cwd(), options.output) : getDefaultOutputPath(input);
      const sizes = parseSizes(options.sizes);
      await run(input, output, sizes);
      process.stdout.write(`생성 완료: ${output}\n`);
    });
  return program;
}

function isCliEntrypoint(): boolean {
  const argvPath = process.argv[1];
  if (!argvPath) {
    return false;
  }
  return import.meta.url === pathToFileURL(argvPath).href;
}

if (isCliEntrypoint()) {
  createProgram()
    .parseAsync(process.argv)
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "알 수 없는 오류";
      process.stderr.write(`img2ico 실패: ${message}\n`);
      process.exitCode = 1;
    });
}
