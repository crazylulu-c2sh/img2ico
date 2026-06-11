import type { Locale } from "./i18n";

const deploySha = import.meta.env.VITE_DEPLOY_SHA ?? "";
const deployTime = import.meta.env.VITE_DEPLOY_TIME ?? "";
const repoName = import.meta.env.VITE_REPO_NAME ?? "";

export function isProductionDeploy(): boolean {
  return deploySha.length > 0 && deployTime.length > 0 && repoName.length > 0;
}

export function getDeploySha(): string {
  return deploySha;
}

export function getDeployTime(): string {
  return deployTime;
}

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

export function formatDeployTime(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function commitUrl(sha: string): string {
  return `https://github.com/${repoName}/commit/${sha}`;
}
