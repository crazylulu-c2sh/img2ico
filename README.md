# img2ico

**다른 언어:** [English](README.en.md) · [日本語](README.ja.md)

이미지를 파비콘에 쓰는 멀티 해상도 `.ico` 파일로 변환하는 모노레포 프로젝트입니다.  
CLI와 웹 UI가 같은 ICO 조립 로직(`@img2ico/core`)을 공유합니다.

## 모노레포 구조

- **`packages/core`**: PNG 청크로부터 ICO 바이너리를 조립하는 공유 로직.
- **`packages/cli`**: Sharp(libvips)로 입력 이미지를 읽고, `@img2ico/core`로 `.ico`를 만드는 CLI.
- **`apps/web`**: Vite 기반 웹 UI에서 동일한 코어 로직을 사용해 브라우저에서 변환·다운로드.

### 지원 입력 (요약)

- **CLI**: [Sharp(libvips)](https://sharp.pixelplumbing.com/)가 디코드하는 포맷을 넓게 지원합니다. 일반적으로 JPEG, PNG, WebP, GIF(첫 프레임), AVIF, TIFF, SVG, BMP, ICO(입력) 등이 포함되며, **HEIF/HEIC, RAW(libraw), PDF(팝플러 등)** 등은 설치된 libvips 빌드·플랫폼에 따라 달라집니다. 손상된 파일도 가능한 한 열리도록 `failOn: none`을 사용합니다.
- **웹**: 브라우저·OS가 디코드할 수 있는 이미지에 한정됩니다. 파일 선택 대화상자는 `accept="image/*,.heic,.heif"`로 열립니다. `createImageBitmap`이 실패하면 `<img>` 로딩으로 한 번 더 시도합니다. CLI보다 포맷 범위가 좁을 수 있습니다.

## 요구사항

- Node.js 20+
- pnpm 10+ (저장소는 `package.json`의 `packageManager` 필드에 맞춘 pnpm 버전 사용을 권장합니다.)

## 설치

```bash
pnpm install
```

## CLI 사용법

아래 예시는 **저장소 루트**(클론한 프로젝트 최상위 디렉터리)에서 실행한다고 가정합니다.  
CLI 로그·오류 메시지는 현재 한국어로 출력됩니다.

먼저 CLI를 빌드합니다.

```bash
pnpm --filter @img2ico/cli build
```

기본 크기 세트(`16,32,48,256`)로 변환 (`node`로 실행):

```bash
node packages/cli/dist/index.js ./path/to/input.png -o ./path/to/favicon.ico
```

같은 작업을 `img2ico` 바이너리로 실행:

```bash
pnpm --filter @img2ico/cli exec img2ico ./path/to/input.png -o ./path/to/favicon.ico
```

크기 직접 지정 (`--sizes` 또는 짧은 형식 `-s`):

```bash
node packages/cli/dist/index.js ./path/to/input.bmp -o ./path/to/favicon.ico -s 16,32,64,128,256
```

표준 입력에서 이미지를 받을 수 있습니다 (`-`):

```bash
cat ./photo.avif | node packages/cli/dist/index.js - -o ./path/to/favicon.ico
```

## 웹 사용법

개발 서버 실행:

```bash
pnpm dev
```

기본 접속 주소(기본 포트 `5173`): `http://localhost:5173`

브라우저에서 파일을 선택하고 해상도 목록을 입력한 뒤 `ICO 생성` 버튼을 누르면 `.ico` 파일이 내려받아집니다.  
화면 언어는 한국어·영어·일본어(`ko` / `en` / `ja`) 중에서 전환할 수 있습니다.

## 스크립트

```bash
pnpm build
pnpm test
pnpm dev
```

## 라이선스

- 프로젝트 라이선스: [`LICENSE`](LICENSE)
- 배포용 서드파티 라이선스 고지: [`LICENSES.md`](LICENSES.md)

## AI 기여(개발 보조) 고지

이 프로젝트의 일부 문서/코드/리팩터링/검토 과정에는 생성형 AI 도구가 보조적으로 활용될 수 있습니다.

- AI는 초안 제안, 코드/문서 정리, 테스트 아이디어 제시에 사용될 수 있습니다.
- 최종 설계 판단, 코드 반영, 검증 및 배포 책임은 프로젝트 유지관리자(사람)에게 있습니다.
- AI가 생성한 결과물은 유지관리자의 검토/수정/테스트를 거쳐 반영됩니다.

## 파비콘 연결 예시

```html
<link rel="icon" href="/favicon.ico" />
```
