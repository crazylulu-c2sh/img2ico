/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEPLOY_SHA?: string;
  readonly VITE_DEPLOY_TIME?: string;
  readonly VITE_REPO_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
