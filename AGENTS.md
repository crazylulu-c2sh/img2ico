# Common Rules
1. Think in English, but answer in Korean.

# 웹 앱 다국어(i18n) — 추가 기능 개발 시

웹 UI(`apps/web`)에 사용자에게 보이는 문구를 추가·변경할 때는 아래를 따른다.

## 지원 범위
- 로케일: **한국어(`ko`)**, **영어(`en`)**, **일본어(`ja`)** 만 지원한다.
- 번역 원본은 [`apps/web/src/i18n.ts`](apps/web/src/i18n.ts)의 `KO`, `EN`, `JA` 객체다. **같은 키를 세 로케일 모두에** 넣는다(누락 시 폴백은 영어 `FALLBACK_LOCALE`).

## 키 네이밍
- 점으로 구분한 플랫 키를 쓴다. 예: `ui.convert`, `errors.pickImage`, `status.done`.
- 성격별 접두사를 맞춘다: `ui.*`(정적 UI), `status.*`(진행/결과 한 줄), `errors.*`(사용자에게 노출하는 오류), `meta.*`, `locale.*` 등 기존 패턴을 따른다.

## 정적 마크업([`apps/web/index.html`](apps/web/index.html))
- 보이는 텍스트·링크 문구: 해당 노드에 `data-i18n="키"`를 붙이고, `i18n.ts`에 문자열을 추가한다.
- `aria-label` 등 속성: `data-i18n-aria-label="키"`를 사용한다(`applyDomTranslations`가 처리).
- `<input>`·`<select>`·`<output>` 등 자식 구조를 깨지 않도록, 긴 문장은 `span`으로 감싼 뒤 그 `span`에만 `data-i18n`을 둔다.

## 런타임([`apps/web/src/main.ts`](apps/web/src/main.ts) 등)
- 사용자에게 보이는 문자열은 **하드코딩하지 않고** `t("키")` 또는 `t("키", { name: value })`를 쓴다.
- 동적 삽입은 플레이스홀더 **`{{변수명}}`** 형식으로 템플릿에 두고, `t`의 두 번째 인자로 치환한다.
- 상태 줄(`#statusText`)은 `setStatusMessage` / `clearStatus`와 번역 키를 쓰고, 언어 전환 시 다시 그려지도록 유지한다(이미 `onLocaleChange`로 `paintStatus` 연동).

## 언어 선택 UI
- [`apps/web/index.html`](apps/web/index.html)의 `#localeSelect` 옵션 라벨은 **각 언어 자기 표기**(한국어 / English / 日本語)와 정책에 맞는 이모지를 유지한다. 이 옵션 텍스트는 `data-i18n`으로 바꾸지 않는다.

## 저장소·초기화
- 사용자 고정 로케일 키: `LOCALE_STORAGE_KEY`(`img2ico.locale`). 변경 시 기존 사용자 설정 마이그레이션을 고려한다.
- 새 화면을 만들면 `initI18n()` 이후 DOM에 붙는 경우에도, 정적 HTML이면 로드 시 `applyDomTranslations`가 처리한다. 스크립트만으로 DOM을 추가할 경우, 추가 후 `applyDomTranslations()`를 호출하거나 `setLocale(getLocale())`로 동일 효과를 낸다.

## 검증
- 문자열 추가·변경 후 `pnpm --filter @img2ico/web test` 및 `build`로 확인한다.
- 로케일 결정·`t` 동작을 건드리면 [`apps/web/src/i18n.test.ts`](apps/web/src/i18n.test.ts)에 케이스를 보강한다.

## 범위 밖
- CLI·코어 패키지(`packages/cli`, `packages/core`)는 별도 제품 문자열이므로, 웹 i18n 규칙을 자동으로 적용하지 않는다(요구 시 해당 패키지 기준으로 따로 정한다).
