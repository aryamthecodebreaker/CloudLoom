import { PrismaClient } from "@prisma/client";
async function main() {
  const d = new PrismaClient();
  const rows = await d.issue.findMany({ where: { status: "OPEN" }, take: 3, orderBy: { refId: "asc" }, select: { id: true, refId: true } });
  console.log(JSON.stringify(rows));
  await d.$disconnect();
}
main();
