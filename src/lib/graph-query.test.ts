import { describe, expect, it } from "vitest";
import { matchClause, matchesAll, parseQuery, type QueryTarget } from "./graph-query";

const node = (over: Partial<QueryTarget> = {}): QueryTarget => ({
  name: "prod-api-asg",
  type: "Virtual Machine",
  provider: "AWS",
  region: "us-east-1",
  worstOpenSeverity: "HIGH",
  isPublic: true,
  hasSensitiveData: false,
  ...over,
});

describe("parseQuery", () => {
  it("returns no clauses for empty or whitespace input", () => {
    expect(parseQuery("").clauses).toHaveLength(0);
    expect(parseQuery("   ").clauses).toHaveLength(0);
  });

  it("parses single and combined clauses", () => {
    const { clauses, error } = parseQuery("severity=critical and exposure=public");
    expect(error).toBeNull();
    expect(clauses).toEqual([
      { key: "severity", value: "critical" },
      { key: "exposure", value: "public" },
    ]);
  });

  it("accepts colon separators and strips quotes/backticks", () => {
    const { clauses, error } = parseQuery("provider: 'aws' and name=`api`");
    expect(error).toBeNull();
    expect(clauses).toContainEqual({ key: "provider", value: "aws" });
    expect(clauses).toContainEqual({ key: "name", value: "api" });
  });

  it("treats bare words as name/type substring clauses", () => {
    const { clauses, error } = parseQuery("checkout");
    expect(error).toBeNull();
    expect(clauses).toEqual([{ key: "name", value: "checkout" }]);
  });

  it("rejects unknown fields", () => {
    const { error } = parseQuery("flavor=vanilla");
    expect(error).toContain("Unknown field");
  });

  it("rejects OR instead of silently mis-parsing", () => {
    const { error } = parseQuery("severity=critical or severity=high");
    expect(error).toContain('"or" is not supported');
  });

  it("rejects a dangling and", () => {
    const { error } = parseQuery("severity=critical and");
    expect(error).toContain("Dangling");
  });
});

describe("matchClause", () => {
  it("matches severity exactly", () => {
    expect(matchClause(node(), { key: "severity", value: "high" })).toBe(true);
    expect(matchClause(node(), { key: "severity", value: "critical" })).toBe(false);
  });

  it("supports + (at least this severe) and - (at most this severe) ranges", () => {
    expect(matchClause(node(), { key: "severity", value: "high+" })).toBe(true);
    expect(matchClause(node(), { key: "severity", value: "critical+" })).toBe(false);
    expect(matchClause(node(), { key: "severity", value: "low-" })).toBe(false); // HIGH is more severe than LOW
    expect(matchClause(node({ worstOpenSeverity: "INFORMATIONAL" }), { key: "severity", value: "low-" })).toBe(true);
    expect(matchClause(node({ worstOpenSeverity: null }), { key: "severity", value: "low-" })).toBe(false);
  });

  it("matches exposure and data strictly (unknown values match nothing)", () => {
    expect(matchClause(node(), { key: "exposure", value: "public" })).toBe(true);
    expect(matchClause(node(), { key: "exposure", value: "banana" })).toBe(false);
    expect(matchClause(node(), { key: "data", value: "sensitive" })).toBe(false);
    expect(matchClause(node({ hasSensitiveData: true }), { key: "data", value: "sensitive" })).toBe(true);
  });

  it("matches provider exactly and type/region/name by substring", () => {
    expect(matchClause(node(), { key: "provider", value: "aws" })).toBe(true);
    expect(matchClause(node(), { key: "provider", value: "gcp" })).toBe(false);
    expect(matchClause(node(), { key: "type", value: "virtual" })).toBe(true);
    expect(matchClause(node(), { key: "region", value: "east" })).toBe(true);
    expect(matchClause(node(), { key: "name", value: "api" })).toBe(true);
  });
});

describe("matchesAll", () => {
  it("requires every clause to match", () => {
    const { clauses } = parseQuery("exposure=public and provider=aws and severity=high+");
    expect(matchesAll(node(), clauses)).toBe(true);
    const { clauses: nope } = parseQuery("exposure=public and provider=gcp");
    expect(matchesAll(node(), nope)).toBe(false);
  });
});
