import { describe, expect, it } from "vitest";
import { getDefaultOutputPath, parseSizes } from "./index.js";

describe("parseSizes", () => {
  it("removes duplicates and parses integers", () => {
    expect(parseSizes("16,32,32,256")).toEqual([16, 32, 256]);
  });

  it("throws for out-of-range values", () => {
    expect(() => parseSizes("0,16")).toThrowError(/1~256/);
  });
});

describe("getDefaultOutputPath", () => {
  it("uses favicon.ico for stdin marker", () => {
    expect(getDefaultOutputPath("-")).toMatch(/favicon\.ico$/);
  });
});
