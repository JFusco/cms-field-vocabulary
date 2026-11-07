---
topics: [official-source-freshness]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/137'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/137']
---
# Retain Contentstack changelog item text

`contentstack.product-changelog-index` kept only RSS `<link>` identities. The November 4 index scan recorded `#manage-entries-directly-from-the-visual-builder-form-panel` with no title, date or description. By November 6 the [registered RSS feed](https://www.contentstack.com/api/docs/changelog/rss.xml) and the [changelog page](https://www.contentstack.com/docs/changelog) no longer listed it, so no official text remained and two weekly reviews left it open.

## Change

- A source can opt in with a top-level `itemText` block (`format: "rss"`, `maximumCharacters`). It needs the `release-index` role and an `identityPattern`. Only the Contentstack changelog opts in.
- Each scan observation for that source now has an `items` array. Every RSS `<item>` gives its identity (found with the source's own identity pattern), plus `title`, `publishedAt` (the raw `pubDate`), `description` and a `truncated` flag. Text comes from the same response that passed the allowlisted, same-document fetch. Items whose link is not on an allowed host are left out.
- CDATA and entity-escaped markup are reduced to plain text. Descriptions are capped at 4,000 characters, titles at 500 and dates at 100. On November 6 the feed had 200 items, which came to about 207 KB of retained text, and one description was truncated.
- Unreachable and removed observations for the source carry `items: []`. Sources that do not opt in have no `items` field.

## Fingerprint and lock behavior

- `fragmentSha256` is still the hash of the sorted identity list. Classification does not change: added or withdrawn identities are `version-changing`, and an edit to an existing entry's text alone is not flagged.
- `itemText` is outside `extract`, so the reviewed lock's `extraction` snapshot still matches. `sources:review` leaves `items` out of lock entries, so the lock still holds only fingerprints and identities. No lock entry was changed or accepted.
- Retained text lives in the uploaded scan artifacts (30-day retention). A later review reads an earlier artifact for an entry the vendor has since withdrawn or edited.

## Scope

The withdrawn November 4 entry has no recoverable official text. Other RSS release indexes, such as `sitecore-ai.changelog-index`, could opt in later but were not changed here.
