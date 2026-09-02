import { rm } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './lib/catalog.mjs';

await rm(path.join(ROOT, 'dist'), { recursive: true, force: true });
