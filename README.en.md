# img2ico

**Languages:** [한국어](README.md) · [日本語](README.ja.md)

This monorepo converts images into multi-resolution `.ico` files for favicons.  
The CLI and web UI share the same ICO assembly logic (`@img2ico/core`).

## Monorepo layout

- **`packages/core`**: Shared logic that assembles ICO binaries from PNG chunks.
- **`packages/cli`**: CLI that reads input images with Sharp (libvips) and writes `.ico` via `@img2ico/core`.
- **`apps/web`**: Vite-based web UI that uses the same core logic for in-browser conversion and download.

### Supported inputs (summary)

- **CLI**: Broad format support via [Sharp (libvips)](https://sharp.pixelplumbing.com/). Typically includes JPEG, PNG, WebP, GIF (first frame), AVIF, TIFF, SVG, BMP, ICO (as input), while **HEIF/HEIC, RAW (libraw), PDF (poppler, etc.)** depend on your libvips build and platform. Damaged files are opened when possible using `failOn: none`.
- **Web**: Limited to what the browser and OS can decode. The file picker uses `accept="image/*,.heic,.heif"`. If `createImageBitmap` fails, loading via `<img>` is tried once more. Format coverage may be narrower than the CLI.

## Requirements

- Node.js 20+
- pnpm 10+ (using the pnpm version pinned in the root `package.json` `packageManager` field is recommended.)

## Install

```bash
pnpm install
```

## CLI usage

The examples below assume the **repository root** (top-level directory of a clone).  
CLI log and error messages are currently emitted in Korean.

Build the CLI first:

```bash
pnpm --filter @img2ico/cli build
```

Convert with the default size set (`16,32,48,256`) using `node`:

```bash
node packages/cli/dist/index.js ./path/to/input.png -o ./path/to/favicon.ico
```

Same operation using the `img2ico` binary:

```bash
pnpm --filter @img2ico/cli exec img2ico ./path/to/input.png -o ./path/to/favicon.ico
```

Custom sizes (`--sizes` or short form `-s`):

```bash
node packages/cli/dist/index.js ./path/to/input.bmp -o ./path/to/favicon.ico -s 16,32,64,128,256
```

Read an image from standard input (`-`):

```bash
cat ./photo.avif | node packages/cli/dist/index.js - -o ./path/to/favicon.ico
```

## Web usage

Start the dev server:

```bash
pnpm dev
```

Default URL (port `5173`): `http://localhost:5173`

Pick a file in the browser, enter resolution sizes, then click the **Build ICO** button to download a `.ico` file.  
The UI can be switched among Korean, English, and Japanese (`ko` / `en` / `ja`).

## Scripts

```bash
pnpm build
pnpm test
pnpm dev
```

## License

- Project license: [`LICENSE`](LICENSE)
- Third-party notices for distribution: [`LICENSES.md`](LICENSES.md)

## AI-assisted development notice

Generative AI tools may assist parts of documentation, code, refactoring, or review for this project.

- AI may help with drafts, cleanup, and test ideas.
- Final design decisions, merges, verification, and release responsibility rest with the human maintainers.
- AI-generated output is reviewed, edited, and tested before landing.

## Favicon link example

```html
<link rel="icon" href="/favicon.ico" />
```
