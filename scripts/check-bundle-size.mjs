import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const outputDirectory = join(process.cwd(), ".next");
const chunksDirectory = join(outputDirectory, "static", "chunks");
const manifestPath = join(outputDirectory, "build-manifest.json");

const limits = {
  initialGzipKb: 220,
  largestChunkGzipKb: 180,
  totalChunksGzipKb: 900,
};

async function collectJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? collectJavaScriptFiles(path)
        : Promise.resolve(entry.name.endsWith(".js") ? [path] : []);
    }),
  );

  return nested.flat();
}

function toKilobytes(bytes) {
  return bytes / 1024;
}

function formatKilobytes(bytes) {
  return `${toKilobytes(bytes).toFixed(1)} kB`;
}

async function gzipSize(path) {
  return gzipSync(await readFile(path)).byteLength;
}

let manifest;
try {
  manifest = JSON.parse(await readFile(manifestPath, "utf8"));
} catch {
  throw new Error("Run `pnpm build` before checking the bundle budget.");
}

const chunkFiles = await collectJavaScriptFiles(chunksDirectory);
const chunks = await Promise.all(
  chunkFiles.map(async (path) => ({ path, gzipBytes: await gzipSize(path) })),
);
const initialFiles = [...manifest.polyfillFiles, ...manifest.rootMainFiles].map(
  (path) => join(outputDirectory, path),
);
const initialGzipBytes = (
  await Promise.all(initialFiles.map((path) => gzipSize(path)))
).reduce((total, size) => total + size, 0);
const totalGzipBytes = chunks.reduce(
  (total, chunk) => total + chunk.gzipBytes,
  0,
);
const largestChunk = chunks.toSorted(
  (left, right) => right.gzipBytes - left.gzipBytes,
)[0];

console.log(`Initial client runtime: ${formatKilobytes(initialGzipBytes)}`);
console.log(`All emitted client chunks: ${formatKilobytes(totalGzipBytes)}`);
console.log(
  `Largest chunk: ${formatKilobytes(largestChunk.gzipBytes)} (${relative(outputDirectory, largestChunk.path)})`,
);

const failures = [];
if (toKilobytes(initialGzipBytes) > limits.initialGzipKb) {
  failures.push(`initial runtime exceeds ${limits.initialGzipKb} kB gzip`);
}
if (toKilobytes(largestChunk.gzipBytes) > limits.largestChunkGzipKb) {
  failures.push(`largest chunk exceeds ${limits.largestChunkGzipKb} kB gzip`);
}
if (toKilobytes(totalGzipBytes) > limits.totalChunksGzipKb) {
  failures.push(`all chunks exceed ${limits.totalChunksGzipKb} kB gzip`);
}

if (failures.length) {
  throw new Error(`Bundle budget failed: ${failures.join("; ")}.`);
}
