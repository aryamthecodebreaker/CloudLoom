import { describe, expect, it } from "vitest";
import { accountScope, edgeScope, resourceScope, denyBelowRole, type WorkspaceContext } from "./scope";

const ctx = (role: WorkspaceContext["role"], accountIds: string[] = ["a1", "a2"]): WorkspaceContext => ({
  userId: "u1",
  email: "u@example.com",
  workspaceId: "w1",
  workspaceName: "Acme",
  ingestToken: "tok",
  role,
  accountIds,
  canWrite: role !== "VIEWER",
});

describe("tenant scoping", () => {
  it("scopes resource-owned models to the workspace's accounts", () => {
    expect(accountScope(ctx("OWNER"))).toEqual({ cloudAccountId: { in: ["a1", "a2"] } });
  });

  it("scopes models reached through a resource relation", () => {
    expect(resourceScope(ctx("OWNER"))).toEqual({
      resource: { cloudAccountId: { in: ["a1", "a2"] } },
    });
  });

  it("requires BOTH edge endpoints to sit inside the workspace", () => {
    const scope = edgeScope(ctx("OWNER"));
    expect(scope.from).toEqual({ cloudAccountId: { in: ["a1", "a2"] } });
    expect(scope.to).toEqual({ cloudAccountId: { in: ["a1", "a2"] } });
  });

  it("yields a scope that matches nothing when the workspace owns no accounts", () => {
    // The empty-workspace case must fail closed: `in: []` matches zero rows
    // rather than degrading to an unscoped query.
    expect(accountScope(ctx("OWNER", []))).toEqual({ cloudAccountId: { in: [] } });
  });
});

describe("role gating", () => {
  it("lets an owner through an ADMIN gate", () => {
    expect(denyBelowRole(ctx("OWNER"), "ADMIN")).toBeNull();
  });

  it("blocks a member from an ADMIN-gated action", () => {
    expect(denyBelowRole(ctx("MEMBER"), "ADMIN")?.status).toBe(403);
  });

  it("blocks a viewer from a MEMBER-gated action", () => {
    expect(denyBelowRole(ctx("VIEWER"), "MEMBER")?.status).toBe(403);
  });

  it("lets a member through a MEMBER gate", () => {
    expect(denyBelowRole(ctx("MEMBER"), "MEMBER")).toBeNull();
  });
});
