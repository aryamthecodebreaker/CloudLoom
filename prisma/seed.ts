import { runSeed } from "../src/lib/seed";

runSeed()
  .then((counts) => {
    console.log("Seeded CloudLoom demo data:", JSON.stringify(counts));
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
