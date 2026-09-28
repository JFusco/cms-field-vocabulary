"use strict";

const GROUPS = [
  { key: "breaking", heading: "Breaking changes" },
  { key: "features", heading: "Features" },
  { key: "fixes", heading: "Fixes" },
  { key: "other", heading: "Other changes" },
];

function compareText(left, right) {
  return left === right ? 0 : left < right ? -1 : 1;
}

function clean(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

function classify(commit) {
  const firstLine = clean(commit.subject || commit.message);
  const parsed = firstLine.match(/^([a-z]+)(?:\(([^)]+)\))?(!)?:\s+(.+)$/i);
  const type = clean(commit.type || parsed?.[1]).toLowerCase();
  const scope = clean(commit.scope || parsed?.[2]);
  const subject = clean(commit.type ? firstLine : parsed?.[4] || firstLine);
  const breaking = Boolean(parsed?.[3]) || commit.breaking === true || (commit.notes?.length || 0) > 0;
  const key = breaking
    ? "breaking"
    : type === "feat"
      ? "features"
      : ["fix", "perf", "revert"].includes(type)
        ? "fixes"
        : "other";
  return {
    hash: clean(commit.hash).slice(0, 7),
    key,
    scope,
    subject: subject || "Unspecified change",
  };
}

function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function renderEntry(item) {
  const scope = item.scope ? `**${item.scope}:** ` : "";
  const hash = item.hash ? ` (\`${item.hash}\`)` : "";
  return `- ${scope}${item.subject}${hash}`;
}

async function generateNotes(_pluginConfig, context) {
  const grouped = Object.fromEntries(GROUPS.map(({ key }) => [key, []]));
  for (const commit of context.commits || []) {
    const item = classify(commit);
    grouped[item.key].push(item);
  }
  for (const items of Object.values(grouped)) {
    items.sort((left, right) =>
      compareText(left.scope, right.scope) ||
      compareText(left.subject, right.subject) ||
      compareText(left.hash, right.hash),
    );
  }

  const counts = Object.fromEntries(GROUPS.map(({ key }) => [key, grouped[key].length]));
  const lines = [
    `# Release ${clean(context.nextRelease?.version) || "pending"}`,
    "",
    "## Summary",
    "",
    `This release contains ${plural(counts.breaking, "breaking change")}, ${plural(counts.features, "feature")}, ${plural(counts.fixes, "fix", "fixes")}, and ${plural(counts.other, "other change")}.`,
  ];

  for (const { key, heading } of GROUPS) {
    lines.push("", `## ${heading}`, "");
    lines.push(...(grouped[key].length ? grouped[key].map(renderEntry) : ["- None."]));
  }
  return `${lines.join("\n")}\n`;
}

module.exports = { GROUPS, classify, generateNotes };
