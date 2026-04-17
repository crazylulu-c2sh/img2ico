export const LOCALE_STORAGE_KEY = "img2ico.locale";

export const SUPPORTED_LOCALES = ["ko", "en", "ja"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const FALLBACK_LOCALE: Locale = "en";

type Messages = Record<string, string>;

const KO: Messages = {
  "meta.pageTitle": "img2ico",
  "locale.selectAria": "표시 언어",
  "ui.intro":
    "브라우저가 디코드할 수 있는 이미지를 파비콘용 멀티 해상도 ICO로 변환합니다. (PNG, JPEG, WebP, GIF, BMP, SVG, AVIF, HEIC 등은 브라우저·OS에 따라 다릅니다.)",
  "ui.github": "GitHub 저장소",
  "ui.dropAria": "이미지를 여기에 놓기",
  "ui.chooseImage": "이미지 선택",
  "ui.dragHint": "또는 파일을 이 영역으로 드래그해 놓으세요.",
  "ui.previewCaption": "편집 미리보기",
  "ui.previewCanvasAria": "편집 미리보기",
  "ui.editHeading": "편집",
  "ui.editLead":
    "ICO로 만들기 전에만 적용됩니다. 맞추기는 콘텐츠에 맞춘 뒤 1:1 정사각으로 맞춥니다. 세부 값은 고급 설정에서 조절할 수 있습니다.",
  "ui.edgeTransparent": "가장자리 배경 투명화",
  "ui.cropSquare": "가장자리 맞추기 (1:1 정사각)",
  "ui.advancedSummary": "고급 설정",
  "ui.advancedHint":
    "가장자리에서 색이 이어진 영역을 배경으로 보고 투명 처리합니다. 배경과 로고 색이 비슷하면 일부가 지워질 수 있습니다. 한 변이 4096px를 넘으면 편집 전에 축소합니다.",
  "ui.seedLegend": "배경 기준 색",
  "ui.seedAuto": "모서리 색 자동",
  "ui.seedManual": "직접 지정",
  "ui.color": "색상",
  "ui.toleranceLabel": "색 허용 오차:",
  "ui.minAlphaLabel": "배경으로 볼 최소 불투명도:",
  "ui.paddingLabel": "맞춘 뒤 패딩(px)",
  "ui.scaleLabel": "배율:",
  "ui.sizesLabel": "해상도 목록 (쉼표 구분)",
  "ui.convert": "ICO 생성",
  "status.processing": "이미지 처리 중...",
  "status.converting": "변환 중...",
  "status.selected": "선택됨: {{name}}{{note}}",
  "status.downscaledNote": " — 편집은 긴 변 기준 최대 4096px로 처리됩니다.",
  "status.loadFailed": "선택됨: {{name}} — 실패: {{message}}",
  "status.done": "완료: {{name}}",
  "status.failed": "실패: {{message}}",
  "errors.missingDom": "필수 DOM 요소를 찾을 수 없습니다: {{label}}",
  "errors.sizesEmpty": "해상도 목록을 입력하세요. 예: 16,32,48,256",
  "errors.sizeRange": "지원하지 않는 크기({{size}})입니다. 1~256 범위만 허용됩니다.",
  "errors.decodeFile": "이 파일을 디코딩할 수 없습니다. 다른 브라우저를 쓰거나 CLI(Sharp)로 변환해 보세요.",
  "errors.imageSizeRead": "이미지 크기를 읽을 수 없습니다.",
  "errors.pngConvert": "PNG 변환에 실패했습니다.",
  "errors.canvas2d": "Canvas 2D 컨텍스트를 만들 수 없습니다.",
  "errors.pickImage": "먼저 이미지를 선택하세요.",
  "errors.unknown": "알 수 없는 오류"
};

const EN: Messages = {
  "meta.pageTitle": "img2ico",
  "locale.selectAria": "Display language",
  "ui.intro":
    "Convert images your browser can decode into a multi-resolution favicon ICO. (PNG, JPEG, WebP, GIF, BMP, SVG, AVIF, HEIC, etc. depend on browser and OS.)",
  "ui.github": "GitHub repository",
  "ui.dropAria": "Drop image here",
  "ui.chooseImage": "Choose image",
  "ui.dragHint": "Or drag and drop a file onto this area.",
  "ui.previewCaption": "Edit preview",
  "ui.previewCanvasAria": "Edit preview",
  "ui.editHeading": "Edit",
  "ui.editLead":
    "Applied only before building the ICO. Fit trims to content then pads to a 1:1 square. Tune details in Advanced settings.",
  "ui.edgeTransparent": "Transparent edge background",
  "ui.cropSquare": "Fit to edges (1:1 square)",
  "ui.advancedSummary": "Advanced settings",
  "ui.advancedHint":
    "Treats similarly colored regions from the edges as background and makes them transparent. If background and logo colors are similar, parts may be removed. If a side exceeds 4096px, the image is downscaled before editing.",
  "ui.seedLegend": "Background seed color",
  "ui.seedAuto": "Auto from corners",
  "ui.seedManual": "Pick manually",
  "ui.color": "Color",
  "ui.toleranceLabel": "Color tolerance:",
  "ui.minAlphaLabel": "Minimum opacity treated as background:",
  "ui.paddingLabel": "Padding after fit (px)",
  "ui.scaleLabel": "Scale:",
  "ui.sizesLabel": "Size list (comma-separated)",
  "ui.convert": "Build ICO",
  "status.processing": "Processing image...",
  "status.converting": "Converting...",
  "status.selected": "Selected: {{name}}{{note}}",
  "status.downscaledNote": " — editing uses a max long side of 4096px.",
  "status.loadFailed": "Selected: {{name}} — failed: {{message}}",
  "status.done": "Done: {{name}}",
  "status.failed": "Failed: {{message}}",
  "errors.missingDom": "Required DOM element not found: {{label}}",
  "errors.sizesEmpty": "Enter a size list, e.g. 16,32,48,256",
  "errors.sizeRange": "Unsupported size ({{size}}). Only 1–256 is allowed.",
  "errors.decodeFile": "Could not decode this file. Try another browser or convert with the CLI (Sharp).",
  "errors.imageSizeRead": "Could not read image dimensions.",
  "errors.pngConvert": "PNG export failed.",
  "errors.canvas2d": "Could not create a Canvas 2D context.",
  "errors.pickImage": "Choose an image first.",
  "errors.unknown": "Unknown error"
};

const JA: Messages = {
  "meta.pageTitle": "img2ico",
  "locale.selectAria": "表示言語",
  "ui.intro":
    "ブラウザがデコードできる画像を、ファビコン用のマルチ解像度 ICO に変換します。(PNG、JPEG、WebP、GIF、BMP、SVG、AVIF、HEIC などはブラウザ・OS により異なります。)",
  "ui.github": "GitHub リポジトリ",
  "ui.dropAria": "ここに画像をドロップ",
  "ui.chooseImage": "画像を選択",
  "ui.dragHint": "またはファイルをこの領域にドラッグ＆ドロップしてください。",
  "ui.previewCaption": "編集プレビュー",
  "ui.previewCanvasAria": "編集プレビュー",
  "ui.editHeading": "編集",
  "ui.editLead":
    "ICO を作成する直前までのみ適用されます。フィットは内容に合わせた後に 1:1 の正方形に揃えます。詳細は詳細設定で調整できます。",
  "ui.edgeTransparent": "端の背景を透明化",
  "ui.cropSquare": "端に合わせる（1:1 正方形）",
  "ui.advancedSummary": "詳細設定",
  "ui.advancedHint":
    "端から色が続く領域を背景として扱い透明にします。背景とロゴの色が近いと一部が消えることがあります。一辺が 4096px を超える場合は編集前に縮小します。",
  "ui.seedLegend": "背景の基準色",
  "ui.seedAuto": "角の色を自動",
  "ui.seedManual": "手動で指定",
  "ui.color": "色",
  "ui.toleranceLabel": "色の許容差:",
  "ui.minAlphaLabel": "背景とみなす最小不透明度:",
  "ui.paddingLabel": "フィット後の余白(px)",
  "ui.scaleLabel": "倍率:",
  "ui.sizesLabel": "解像度リスト（カンマ区切り）",
  "ui.convert": "ICO を生成",
  "status.processing": "画像を処理しています...",
  "status.converting": "変換中...",
  "status.selected": "選択中: {{name}}{{note}}",
  "status.downscaledNote": " — 編集は長辺最大 4096px で行われます。",
  "status.loadFailed": "選択中: {{name}} — 失敗: {{message}}",
  "status.done": "完了: {{name}}",
  "status.failed": "失敗: {{message}}",
  "errors.missingDom": "必須の DOM 要素が見つかりません: {{label}}",
  "errors.sizesEmpty": "解像度リストを入力してください。例: 16,32,48,256",
  "errors.sizeRange": "サポート外のサイズ ({{size}}) です。1〜256 のみ許可されます。",
  "errors.decodeFile":
    "このファイルをデコードできません。別のブラウザを試すか、CLI (Sharp) で変換してください。",
  "errors.imageSizeRead": "画像サイズを読み取れませんでした。",
  "errors.pngConvert": "PNG への変換に失敗しました。",
  "errors.canvas2d": "Canvas 2D コンテキストを作成できませんでした。",
  "errors.pickImage": "先に画像を選択してください。",
  "errors.unknown": "不明なエラー"
};

const CATALOG: Record<Locale, Messages> = {
  ko: KO,
  en: EN,
  ja: JA
};

const localeChangeListeners = new Set<(locale: Locale) => void>();

let currentLocale: Locale = FALLBACK_LOCALE;

export function isLocale(value: string | null | undefined): value is Locale {
  return value !== undefined && value !== null && SUPPORTED_LOCALES.includes(value as Locale);
}

export function readStoredLocale(): Locale | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function pickBrowserLocale(): Locale {
  if (typeof navigator === "undefined") {
    return FALLBACK_LOCALE;
  }
  const list = navigator.languages?.length ? [...navigator.languages] : [navigator.language];
  for (const raw of list) {
    try {
      const lang = new Intl.Locale(raw).language;
      if (isLocale(lang)) {
        return lang;
      }
    } catch {
      const base = raw.split("-")[0]?.toLowerCase();
      if (isLocale(base)) {
        return base;
      }
    }
  }
  return FALLBACK_LOCALE;
}

export function resolveLocale(): Locale {
  return readStoredLocale() ?? pickBrowserLocale();
}

export function getLocale(): Locale {
  return currentLocale;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) {
    return template;
  }
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(String(value));
  }
  return out;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const primary = CATALOG[currentLocale]?.[key];
  const fallback = CATALOG[FALLBACK_LOCALE]?.[key];
  const template = primary ?? fallback ?? key;
  return interpolate(template, vars);
}

export function applyMetaTranslations(): void {
  document.title = t("meta.pageTitle");
}

export function applyDomTranslations(): void {
  for (const el of document.querySelectorAll("[data-i18n]")) {
    const key = el.getAttribute("data-i18n");
    if (!key) {
      continue;
    }
    const text = t(key);
    if (el instanceof HTMLTitleElement) {
      el.textContent = text;
      continue;
    }
    if (el.tagName === "TITLE") {
      continue;
    }
    el.textContent = text;
  }

  for (const el of document.querySelectorAll("[data-i18n-aria-label]")) {
    const key = el.getAttribute("data-i18n-aria-label");
    if (!key) {
      continue;
    }
    el.setAttribute("aria-label", t(key));
  }

}

function syncLocaleSelect(): void {
  const sel = document.querySelector<HTMLSelectElement>("#localeSelect");
  if (!sel) {
    return;
  }
  if (sel.value !== currentLocale) {
    sel.value = currentLocale;
  }
}

export function setLocale(next: Locale): void {
  currentLocale = next;
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore quota / private mode */
    }
  }
  document.documentElement.lang = next;
  applyMetaTranslations();
  applyDomTranslations();
  syncLocaleSelect();
  for (const cb of localeChangeListeners) {
    cb(next);
  }
}

export function onLocaleChange(handler: (locale: Locale) => void): () => void {
  localeChangeListeners.add(handler);
  return () => {
    localeChangeListeners.delete(handler);
  };
}

export function initI18n(): void {
  currentLocale = resolveLocale();
  document.documentElement.lang = currentLocale;
  applyMetaTranslations();
  applyDomTranslations();
  syncLocaleSelect();

  const sel = document.querySelector<HTMLSelectElement>("#localeSelect");
  if (sel) {
    sel.addEventListener("change", () => {
      if (isLocale(sel.value)) {
        setLocale(sel.value);
      }
    });
  }
}
