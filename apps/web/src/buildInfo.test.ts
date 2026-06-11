import { describe, expect, it } from "vitest";
import { formatDeployTime, shortSha } from "./buildInfo";

describe("shortSha", () => {
  it("returns the first seven characters", () => {
    expect(shortSha("abcdef1234567890")).toBe("abcdef1");
  });
});

describe("formatDeployTime", () => {
  it("formats ISO timestamps for ko locale", () => {
    const formatted = formatDeployTime("2026-06-11T06:42:00.000Z", "ko");
    expect(formatted.length).toBeGreaterThan(0);
    expect(formatted).not.toBe("2026-06-11T06:42:00.000Z");
  });

  it("returns the original string for invalid dates", () => {
    expect(formatDeployTime("not-a-date", "en")).toBe("not-a-date");
  });
});
