#!/usr/bin/env node

// Backfills summary.cores.repository_links on existing cores documents from each
// core's cruise and core names.
//
//   node imports/scripts/backfill_repository_links.js                  # dry run, prints a sample
//   node imports/scripts/backfill_repository_links.js --apply          # writes to the index
//   node imports/scripts/backfill_repository_links.js --index my-index # override the target index
//
// Reads the OpenSearch node and default index from settings.json.

const fs = require("fs");
const path = require("path");
const opensearch = require("@opensearch-project/opensearch");

const settings = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "settings.json"), "utf8")
);

const argv = process.argv.slice(2);
const apply = argv.includes("--apply");
const indexArg = argv.indexOf("--index");
const index =
  (indexArg !== -1 && argv[indexArg + 1]) ||
  (settings.public && settings.public.cdr && settings.public.cdr.index);

const node = settings.opensearch && settings.opensearch.node;

if (!node) throw new Error("No opensearch.node in settings.json");
if (!index) throw new Error("No index configured; pass --index <name>");

const client = new opensearch.Client({
  node,
  keepAlive: false,
  requestTimeout: 60 * 60 * 1000,
});

// Mirrors deriveRepositoryLinks() in lib/configs/cdr/repositories.js. Kept inline
// so this script runs under plain node without the Meteor/ESM build.
const buildUrl = (cruise, core) =>
  cruise && core ? `https://osu-mgr.org/OSU-${cruise}-${core}` : undefined;

// Only touch latest-version cores that have both names and no links yet.
const query = {
  bool: {
    filter: [
      { term: { "summary.contribution._is_latest": "true" } },
      { exists: { field: "summary.cores.cruise" } },
      { exists: { field: "summary.cores.core" } },
    ],
    must_not: [{ exists: { field: "summary.cores.repository_links" } }],
  },
};

const first = (val) => (Array.isArray(val) ? val[0] : val);

async function main() {
  const counted = await client.count({ index, body: { query } });
  const total = counted.body.count;
  console.log(`${total} cores in "${index}" are missing repository_links.`);

  if (total === 0) return;

  const sample = await client.search({
    index,
    body: {
      size: 10,
      query,
      _source: ["summary.cores.cruise", "summary.cores.core"],
    },
  });

  console.log("\nSample of what would be written:\n");
  for (const hit of sample.body.hits.hits) {
    const cores = (hit._source.summary || {}).cores || {};
    const cruise = first(cores.cruise);
    const core = first(cores.core);
    const url = buildUrl(cruise, core);
    console.log(
      `  ${hit._id}  cruise=${cruise}  core=${core}\n    -> ${url || "SKIPPED (missing name)"}`
    );
  }

  if (!apply) {
    console.log(
      "\nDry run. Verify the URLs above resolve, then re-run with --apply."
    );
    return;
  }

  console.log(`\nApplying to ${total} documents...`);
  const result = await client.update_by_query({
    index,
    refresh: true,
    wait_for_completion: true,
    conflicts: "proceed",
    body: {
      query,
      script: {
        lang: "painless",
        source: `
          def cores = ctx._source.summary.cores;
          if (cores == null) return;
          def cruise = cores.cruise instanceof List ? cores.cruise[0] : cores.cruise;
          def core = cores.core instanceof List ? cores.core[0] : cores.core;
          if (cruise == null || core == null) return;
          def url = 'https://osu-mgr.org/OSU-' + cruise + '-' + core;
          cores.repository_links = [['key': params.name, 'value': url]];
        `,
        params: { name: "OSU-MGR" },
      },
    },
  });

  console.log(
    `Updated ${result.body.updated}, skipped ${result.body.total - result.body.updated}, failures: ${result.body.failures.length}`
  );
  if (result.body.failures.length) console.log(result.body.failures.slice(0, 5));
}

main()
  .catch((err) => {
    console.error(err.meta ? err.meta.body : err);
    process.exit(1);
  })
  .finally(() => client.close());
