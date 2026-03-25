# LICENSES

This file is part of the distribution package.

본 문서는 `img2ico` 배포물에 포함되는 **서드파티 라이선스 고지**입니다.
프로젝트 자체 라이선스는 별도 `LICENSE` 파일을 따릅니다.

## 1) 고지 대상 구성요소

배포 시 적용되는 핵심 서드파티 구성요소:

| 구성요소 | 버전 | 라이선스 |
|---|---:|---|
| `sharp` | `0.33.5` | `Apache-2.0` |
| `@img/sharp-darwin-arm64` | `0.33.5` | `Apache-2.0` |
| `@img/sharp-libvips-darwin-arm64` | `1.0.4` | `LGPL-3.0-or-later` |
| `commander` | `13.1.0` | `MIT` |
| `vite` | `6.4.1` | `MIT` |
| `typescript` | `5.9.3` | `Apache-2.0` |
| `vitest` | `3.2.4` | `MIT` |
| `@types/node` | `22.19.15` | `MIT` |

본 저장소는 배포 시 아래 라이선스 전문 파일을 함께 제공합니다.

- `licenses/Apache-2.0.txt`
- `licenses/MIT.txt`
- `licenses/ISC.txt`
- `licenses/BSD-3-Clause.txt`
- `licenses/LGPL-3.0-or-later.txt`
- `licenses/GPL-3.0.txt` (LGPL 관련 참조)

## 2) 라이선스 고지 및 재배포 조건

아래 조건은 해당 라이선스가 적용되는 구성요소에 대해 재배포 시 적용됩니다.

### 2.1 MIT / ISC / BSD-3-Clause

- 소스 및 바이너리 재배포 시 원 저작권 고지와 라이선스 고지를 유지합니다.
- 보증 부인(AS IS) 조항을 유지합니다.

### 2.2 Apache-2.0

- Apache License 2.0 사본을 제공합니다.
- 저작권/특허/상표/저작자 고지를 유지합니다.
- 수정 파일에는 변경 사실을 명시합니다.
- upstream 패키지에 `NOTICE`가 포함된 경우 해당 고지를 함께 제공합니다.

### 2.3 LGPL-3.0-or-later (`@img/sharp-libvips-*`)

- LGPL 라이선스 사본을 제공합니다.
- 라이브러리 교체/재링크를 제한하지 않는 방식으로 배포합니다.
- 라이브러리 자체 수정본을 배포하는 경우, 해당 수정본 소스 및 고지를 제공합니다.
- 단일 바이너리/정적 결합 등 배포 형태에 따라 필요한 추가 고지를 포함합니다.

## 3) 배포물 포함 파일

GitHub 릴리즈(소스 아카이브/바이너리)에는 아래 파일을 포함합니다.

- `LICENSE` (프로젝트 자체 라이선스)
- `LICENSES.md` (현재 문서)
- `licenses/` 디렉터리의 라이선스 전문 파일
- 해당되는 upstream `NOTICE` 파일(Apache-2.0 구성요소에 존재하는 경우)

## 4) 의존성 변경 시 갱신

의존성 버전이 변경되면 라이선스 정보를 재검증하고 본 문서를 갱신합니다.

```bash
pnpm licenses list --json
```
