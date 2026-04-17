# img2ico

**言語:** [한국어](README.md) · [English](README.en.md)

画像をファビコン用のマルチ解像度 `.ico` に変換するモノレポです。  
CLI と Web UI は同じ ICO 組み立てロジック（`@img2ico/core`）を共有します。

## モノレポ構成

- **`packages/core`**: PNG チャンクから ICO バイナリを組み立てる共有ロジック。
- **`packages/cli`**: Sharp（libvips）で入力画像を読み、`@img2ico/core` で `.ico` を生成する CLI。
- **`apps/web`**: Vite ベースの Web UI で同じコアを使い、ブラウザ上で変換・ダウンロード。

### 対応入力（概要）

- **CLI**: [Sharp（libvips）](https://sharp.pixelplumbing.com/) がデコードできる形式を広くサポートします。一般的には JPEG、PNG、WebP、GIF（先頭フレーム）、AVIF、TIFF、SVG、BMP、ICO（入力）など。**HEIF/HEIC、RAW（libraw）、PDF（poppler など）** はインストールされている libvips のビルド・OS により異なります。破損データも可能な限り開くよう `failOn: none` を使います。
- **Web**: ブラウザ・OS がデコードできる画像に限定されます。ファイル選択ダイアログは `accept="image/*,.heic,.heif"` で開きます。`createImageBitmap` が失敗した場合は `<img>` 読み込みを一度試します。CLI より形式の幅が狭い場合があります。

## 要件

- Node.js 20+
- pnpm 10+（ルート `package.json` の `packageManager` に合わせた pnpm の利用を推奨します。）

## インストール

```bash
pnpm install
```

## CLI の使い方

以下は **リポジトリのルート**（クローンしたプロジェクトの最上位ディレクトリ）で実行する想定です。  
CLI のログ・エラーメッセージは現時点では韓国語で出力されます。

まず CLI をビルドします。

```bash
pnpm --filter @img2ico/cli build
```

既定のサイズ集合（`16,32,48,256`）で変換（`node` で実行）:

```bash
node packages/cli/dist/index.js ./path/to/input.png -o ./path/to/favicon.ico
```

同じ操作を `img2ico` バイナリで実行:

```bash
pnpm --filter @img2ico/cli exec img2ico ./path/to/input.png -o ./path/to/favicon.ico
```

サイズを直接指定（`--sizes` または短い形式 `-s`）:

```bash
node packages/cli/dist/index.js ./path/to/input.bmp -o ./path/to/favicon.ico -s 16,32,64,128,256
```

標準入力から画像を受け取れます（`-`）:

```bash
cat ./photo.avif | node packages/cli/dist/index.js - -o ./path/to/favicon.ico
```

## Web の使い方

開発サーバーを起動:

```bash
pnpm dev
```

既定の URL（既定ポート `5173`）: `http://localhost:5173`

ブラウザでファイルを選び、解像度リストを入力して「**ICO を生成**」ボタンを押すと `.ico` がダウンロードされます。  
画面言語は韓国語・英語・日本語（`ko` / `en` / `ja`）に切り替えできます。

## スクリプト

```bash
pnpm build
pnpm test
pnpm dev
```

## ライセンス

- プロジェクトライセンス: [`LICENSE`](LICENSE)
- 配布用サードパーティ表記: [`LICENSES.md`](LICENSES.md)

## AI による開発補助の注記

本プロジェクトの一部の文書・コード・リファクタリング・レビュー過程では、生成 AI ツールが補助的に利用されることがあります。

- AI は下書き提案、コード・文書の整理、テストのアイデア提示などに使われることがあります。
- 最終的な設計判断、コード反映、検証・リリースの責任はプロジェクトのメンテナー（人間）にあります。
- AI が生成した成果物は、メンテナーのレビュー・修正・テストを経て取り込まれます。

## ファビコン連結の例

```html
<link rel="icon" href="/favicon.ico" />
```
