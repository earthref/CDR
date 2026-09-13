#!/usr/bin/env node

// Adds a repository_links column to the cores table of contribution files in S3,
// derived from each core's cruise and core names.
//
//   node imports/scripts/backfill_s3_repository_links.js                 # dry run, prints diffs
//   node imports/scripts/backfill_s3_repository_links.js --limit 3       # dry run over 3 files
//   node imports/scripts/backfill_s3_repository_links.js --apply         # writes (backs up first)
//   node imports/scripts/backfill_s3_repository_links.js --bucket cdr-private-contributions
//
// Edits the cores table in place as text rather than re-exporting the whole file,
// so every other byte of the contribution is preserved exactly.
//
// Each overwritten file is first copied to <key>.bak-<runId> in the same bucket.

const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");

const settings = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "settings.json"), "utf8")
);

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};
const apply = argv.includes("--apply");
const bucket = flag("bucket", "cdr-activated-contributions");
const limit = parseInt(flag("limit", "0"), 10) || 0;
const runId = flag("run-id", "backfill");

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  accessKeyId: settings.s3.accessKeyId,
  secretAccessKey: settings.s3.secretAccessKey,
});

const COLUMN = "repository_links";
const REPOSITORY = "OSU-MGR";

// Mirrors deriveRepositoryLinks() in lib/configs/cdr/repositories.js. Inlined so this
// runs under plain node without the Meteor/ESM build.
const escape = (v) => (v.indexOf(":") >= 0 ? `"${v}"` : v);
const buildCell = (cruise, core) =>
  cruise && core
    ? `${REPOSITORY}[${escape(`https://osu-mgr.org/OSU-${cruise}-${core}`)}]`
    : undefined;

// Walks the MagIC-format text and rewrites only the cores table. Returns the new
// text plus a per-core report, or null when nothing changed.
function addRepositoryLinks(text) {
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);

  let table;
  let tableLine = 0;
  let columns = [];
  let cruiseIdx = -1;
  let coreIdx = -1;
  let linksIdx = -1;
  let changed = false;
  const report = [];

  const out = lines.map((line) => {
    if (line.trim() === "") return line;

    if (/^>+$/.test(line.trim())) {
      table = undefined;
      tableLine = 0;
      columns = [];
      return line;
    }

    tableLine++;

    if (tableLine === 1) {
      const parts = line.split("\t").map((p) => p.trim());
      table = parts[1] && parts[1].toLowerCase();
      return line;
    }

    if (table !== "cores") return line;

    if (tableLine === 2) {
      columns = line.split("\t").map((c) => c.trim().toLowerCase());
      cruiseIdx = columns.indexOf("cruise");
      coreIdx = columns.indexOf("core");
      linksIdx = columns.indexOf(COLUMN);
      if (cruiseIdx === -1 || coreIdx === -1) return line; // can't derive; leave alone
      if (linksIdx !== -1) return line; // column already present
      changed = true;
      linksIdx = columns.length;
      columns.push(COLUMN);
      return line + "\t" + COLUMN;
    }

    if (cruiseIdx === -1 || coreIdx === -1) return line;

    const cells = line.split("\t");
    // Row already carried a value in an existing column: leave it untouched.
    if (cells.length > linksIdx && cells[linksIdx] && cells[linksIdx].trim())
      return line;

    const cell = buildCell(
      (cells[cruiseIdx] || "").trim(),
      (cells[coreIdx] || "").trim()
    );
    report.push({
      cruise: (cells[cruiseIdx] || "").trim(),
      core: (cells[coreIdx] || "").trim(),
      cell: cell || null,
    });
    // Pad short rows so the new value lands in the right column.
    while (cells.length < linksIdx) cells.push("");
    cells[linksIdx] = cell || "";
    return cells.join("\t");
  });

  if (!changed) return null;
  return { text: out.join(newline), report };
}

async function listContributionKeys() {
  const keys = [];
  let token;
  do {
    const page = await s3
      .listObjectsV2({ Bucket: bucket, ContinuationToken: token })
      .promise();
    for (const obj of page.Contents || []) {
      if (/cdr_contribution_\d+\.txt$/.test(obj.Key)) keys.push(obj.Key);
    }
    token = page.NextContinuationToken;
  } while (token && (!limit || keys.length < limit));
  return limit ? keys.slice(0, limit) : keys;
}

async function main() {
  console.log(`Bucket: ${bucket}${apply ? "  (APPLY)" : "  (dry run)"}`);
  const keys = await listContributionKeys();
  console.log(`${keys.length} contribution files to inspect.\n`);

  let changedFiles = 0;
  let changedRows = 0;
  let skippedRows = 0;

  for (const key of keys) {
    const original = (
      await s3.getObject({ Bucket: bucket, Key: key }).promise()
    ).Body.toString("utf-8");

    const result = addRepositoryLinks(original);
    if (!result) continue;

    changedFiles++;
    const derived = result.report.filter((r) => r.cell);
    const missing = result.report.filter((r) => !r.cell);
    changedRows += derived.length;
    skippedRows += missing.length;

    console.log(`${key}: ${derived.length} cores linked, ${missing.length} skipped`);
    for (const r of derived.slice(0, 3))
      console.log(`    ${r.cruise} / ${r.core} -> ${r.cell}`);
    for (const r of missing.slice(0, 3))
      console.log(`    ${r.cruise} / ${r.core} -> SKIPPED (missing name)`);

    if (apply) {
      await s3
        .copyObject({
          Bucket: bucket,
          CopySource: encodeURIComponent(`${bucket}/${key}`),
          Key: `${key}.bak-${runId}`,
        })
        .promise();
      await s3
        .putObject({ Bucket: bucket, Key: key, Body: result.text })
        .promise();
    }
  }

  console.log(
    `\n${changedFiles} files ${apply ? "updated" : "would change"}; ` +
      `${changedRows} cores linked, ${skippedRows} skipped.`
  );
  if (!apply)
    console.log("Dry run. Verify the URLs above resolve, then re-run with --apply.");
}

module.exports = { addRepositoryLinks };

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
