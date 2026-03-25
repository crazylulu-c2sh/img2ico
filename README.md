# img2ico

이미지를 파비콘에 쓰는 멀티 해상도 `.ico` 파일로 변환하는 모노레포 프로젝트입니다.  
CLI와 웹 UI가 같은 ICO 조립 로직(`@img2ico/core`)을 공유합니다.

### 지원 입력 (요약)

- **CLI**: [Sharp(libvips)](https://sharp.pixelplumbing.com/)가 디코드하는 포맷을 넓게 지원합니다. 일반적으로 JPEG, PNG, WebP, GIF(첫 프레임), AVIF, TIFF, SVG, BMP, ICO(입력) 등이 포함되며, **HEIF/HEIC, RAW(libraw), PDF(팝플러 등)** 등은 설치된 libvips 빌드·플랫폼에 따라 달라집니다. 손상된 파일도 가능한 한 열리도록 `failOn: none`을 사용합니다.
- **웹**: 브라우저·OS가 디코드할 수 있는 이미지에 한정됩니다. 파일 선택은 `*/*`로 열어 두었고, `createImageBitmap`이 실패하면 `<img>` 로딩으로 한 번 더 시도합니다. CLI보다 포맷 범위가 좁을 수 있습니다.

## 요구사항

- Node.js 20+
- pnpm 10+

## 설치

```bash
pnpm install
```

## CLI 사용법

기본 크기 세트(`16,32,48,256`)로 변환:

```bash
pnpm --filter @img2ico/cli build
node /Users/crazylulu/dev/img2ico/packages/cli/dist/index.js /absolute/path/to/input.png -o /absolute/path/to/favicon.ico
```

크기 직접 지정:

```bash
node /Users/crazylulu/dev/img2ico/packages/cli/dist/index.js /absolute/path/to/input.bmp -o /absolute/path/to/favicon.ico --sizes 16,32,64,128,256
```

표준 입력에서 이미지를 받을 수 있습니다 (`-`):

```bash
cat ./photo.avif | node /Users/crazylulu/dev/img2ico/packages/cli/dist/index.js - -o /absolute/path/to/favicon.ico
```

## 웹 사용법

개발 서버 실행:

```bash
pnpm dev
```

기본 접속 주소(기본 포트 `5173`): `http://localhost:5173`

브라우저에서 파일을 선택하고 해상도 목록을 입력한 뒤 `ICO 생성` 버튼을 누르면 `.ico` 파일이 내려받아집니다.

## 스크립트

```bash
pnpm build
pnpm test
pnpm dev
```

## 파비콘 연결 예시

```html
<link rel="icon" href="/favicon.ico" />
```
