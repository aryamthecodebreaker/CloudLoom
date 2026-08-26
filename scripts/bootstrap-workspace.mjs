#!/usr/bin/env node
/**
 * Upgrade path for a self-host that ingested data before workspaces existed.
 *
 * Cloud accounts and events created back then belong to no workspace. This
 * moves them into a single "Default" workspace with no members, which the
 * first person to register then inherits as OWNER.
 *
 * Run it ONCE against your database before `npm run db:push` picks up the
 * NOT NULL constraints on CloudAccount.workspaceId and CloudEvent.workspaceId:
 *
 *     node scripts/bootstrap-workspace.mjs
 *
 * Idempotent — running it again when nothing is orphaned is a no-op.
 */
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

const db = new PrismaClient();

const orphanAccounts = await db.cloudAccount.count({ where: { workspaceId: null } });
const orphanEvents = await db.cloudEvent.count({ where: { workspaceId: null } });

if (orphanAccounts === 0 && orphanEvents === 0) {
  console.log("Nothing orphaned — no bootstrap needed.");
  await db.$disconnect();
  process.exit(0);
}

console.log(`Orphaned: ${orphanAccounts} cloud account(s), ${orphanEvents} event(s).`);

// Reuse the env INGEST_TOKEN as the workspace token when it is set, so agents
// already configured against this deployment keep pushing to the same place.
const ingestToken =
  process.env.INGEST_TOKEN ||
  randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");

const workspace =
  (await db.workspace.findFirst({ where: { name: "Default" } })) ??
  (await db.workspace.create({ data: { name: "Default", ingestToken } }));

const accounts = await db.cloudAccount.updateMany({
  where: { workspaceId: null },
  data: { workspaceId: workspace.id },
});
const events = await db.cloudEvent.updateMany({
  where: { workspaceId: null },
  data: { workspaceId: workspace.id },
});

const members = await db.accountMember.count({ where: { workspaceId: workspace.id } });

console.log(`Adopted ${accounts.count} account(s) and ${events.count} event(s) into "${workspace.name}".`);
console.log(
  members === 0
    ? "It has no members yet — the first account you register inherits it as OWNER."
    : `It already has ${members} member(s); they can see this data now.`
);

await db.$disconnect();
