import { describe, expect, it } from "vitest";
import { csvCell } from "./csv";

describe("csvCell", () => {
  it("leaves plain values untouched", () => {
    expect(csvCell("CL-1042")).toBe("CL-1042");
    expect(csvCell(9.1)).toBe("9.1");
  });

  it("quotes values containing commas, quotes, or newlines", () => {
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
    expect(csvCell("line1\r\nline2")).toBe('"line1\r\nline2"');
  });

  it("handles the classic triple-whammy: quotes + comma + newline", () => {
    const v = 'he said "run",\nthen left';
    expect(csvCell(v)).toBe('"he said ""run"",\nthen left"');
  });
});
