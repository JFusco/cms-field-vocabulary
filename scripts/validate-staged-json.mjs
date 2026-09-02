import { readFile } from 'node:fs/promises';

for (const file of process.argv.slice(2)) JSON.parse(await readFile(file, 'utf8'));
