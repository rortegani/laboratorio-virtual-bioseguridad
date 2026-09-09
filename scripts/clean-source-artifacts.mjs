import { readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

async function cleanSourceDirectory(directory) {
  let removed = 0;
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      removed += await cleanSourceDirectory(path);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.js.map'))) {
      await unlink(path);
      removed += 1;
      console.log(`Removed ${path}`);
    }
  }

  return removed;
}

const removed = await cleanSourceDirectory(fileURLToPath(new URL('../src/', import.meta.url)));
console.log(`Removed ${removed} source artifact${removed === 1 ? '' : 's'}.`);
