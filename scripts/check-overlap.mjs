#!/usr/bin/env node
// Flags any run of N identical words shared between this repo's content and
// reference texts kept OUTSIDE the repo (e.g. other cheat sheets you've read).
//
//   node scripts/check-overlap.mjs ~/old/README.md ~/old/index.html
//   OVERLAP_WORDS=5 node scripts/check-overlap.mjs ~/old/*.md
//
// Exits 1 if anything matches, so it can gate a release.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const N = Number(process.env.OVERLAP_WORDS ?? 6);
const refs = process.argv.slice(2);
if (refs.length === 0) {
  console.error("Usage: node scripts/check-overlap.mjs <reference-file>...");
  process.exit(2);
}

const words = (text) =>
  text
    .replace(/<[^>]+>/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

const ngrams = (list) => {
  const out = new Set();
  for (let i = 0; i + N <= list.length; i++) out.add(list.slice(i, i + N).join(" "));
  return out;
};

const refGrams = new Set(refs.flatMap((f) => [...ngrams(words(readFileSync(f, "utf8")))]));

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = [...walk("src/content"), "README.md"];
let hits = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  // Only compare prose: string literals in TS, everything in Markdown.
  const prose = file.endsWith(".ts") ? [...text.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/g)].map((m) => m[2]).join(" . ") : text;
  for (const gram of ngrams(words(prose))) {
    if (refGrams.has(gram)) {
      console.log(`${file}: "${gram}"`);
      hits++;
    }
  }
}
console.log(hits ? `\n${hits} shared ${N}-word runs. Rewrite these.` : `No shared ${N}-word runs.`);
process.exit(hits ? 1 : 0);
