// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function loadI18n() {
  vi.resetModules();
  return import("./i18n");
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("pickBrowserLocale", () => {
  it("maps ja-JP to ja", async () => {
    vi.stubGlobal("navigator", { languages: ["ja-JP"], language: "ja-JP" });
    const { pickBrowserLocale } = await loadI18n();
    expect(pickBrowserLocale()).toBe("ja");
  });

  it("falls back to en for unsupported languages", async () => {
    vi.stubGlobal("navigator", { languages: ["zh-CN", "de-DE"], language: "zh-CN" });
    const { pickBrowserLocale } = await loadI18n();
    expect(pickBrowserLocale()).toBe("en");
  });

  it("uses first supported language in the list", async () => {
    vi.stubGlobal("navigator", { languages: ["fr", "ko-KR"], language: "fr" });
    const { pickBrowserLocale } = await loadI18n();
    expect(pickBrowserLocale()).toBe("ko");
  });
});

describe("resolveLocale", () => {
  it("prefers stored locale over browser list", async () => {
    localStorage.setItem("img2ico.locale", "ja");
    vi.stubGlobal("navigator", { languages: ["en-US"], language: "en-US" });
    const { resolveLocale } = await loadI18n();
    expect(resolveLocale()).toBe("ja");
  });

  it("uses browser list when storage is empty", async () => {
    vi.stubGlobal("navigator", { languages: ["ko-KR"], language: "ko-KR" });
    const { resolveLocale } = await loadI18n();
    expect(resolveLocale()).toBe("ko");
  });
});

describe("setLocale and t", () => {
  it("persists locale and translates strings", async () => {
    vi.stubGlobal("navigator", { languages: ["en-US"], language: "en-US" });
    const { setLocale, getLocale, t, LOCALE_STORAGE_KEY } = await loadI18n();
    setLocale("ja");
    expect(getLocale()).toBe("ja");
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("ja");
    expect(document.documentElement.lang).toBe("ja");
    expect(t("ui.convert")).toBe("ICO を生成");
  });

  it("interpolates placeholders", async () => {
    vi.stubGlobal("navigator", { languages: ["en-US"], language: "en-US" });
    const { setLocale, t } = await loadI18n();
    setLocale("en");
    expect(t("status.selected", { name: "a.png", note: " — note" })).toBe("Selected: a.png — note");
  });
});
