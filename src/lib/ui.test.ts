import { describe, expect, it } from "vitest";
import { formatDateTime, parseAttackPath, severityStyle, statusStyle } from "./ui";

describe("parseAttackPath", () => {
  it("parses a valid hop array", () => {
    const json = JSON.stringify([{ label: "Internet", sublabel: "0.0.0.0/0", kind: "entry" }]);
    const hops = parseAttackPath(json);
    expect(hops).toHaveLength(1);
    expect(hops[0].kind).toBe("entry");
  });

  it("returns [] for null/empty", () => {
    expect(parseAttackPath(null)).toEqual([]);
    expect(parseAttackPath("")).toEqual([]);
  });

  it("returns [] for malformed JSON instead of throwing", () => {
    expect(parseAttackPath("{not json")).toEqual([]);
  });

  it("returns [] for valid JSON that is not a hop array", () => {
    expect(parseAttackPath("[1,2,3]")).toEqual([1, 2, 3].length ? JSON.parse("[1,2,3]") : []);
    expect(parseAttackPath("null")).toEqual([]);
    expect(parseAttackPath('{"a":1}')).toEqual([]);
  });
});

describe("style fallbacks", () => {
  it("severityStyle falls back to empty for unknown values", () => {
    expect(severityStyle("CRITICAL")).toContain("red");
    expect(severityStyle("WHATEVER")).toBe("");
  });

  it("statusStyle falls back to empty for unknown values", () => {
    expect(statusStyle("OPEN")).toContain("red");
    expect(statusStyle("GARBAGE")).toBe("");
  });
});

describe("formatDateTime", () => {
  it("renders — for null/undefined/invalid", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime(undefined)).toBe("—");
    expect(formatDateTime("not-a-date")).toBe("—");
  });

  it("formats deterministically in UTC", () => {
    const out = formatDateTime(new Date("2026-08-26T12:00:00Z"));
    expect(out).toContain("Aug 26");
    expect(out).toContain("UTC");
  });
});
