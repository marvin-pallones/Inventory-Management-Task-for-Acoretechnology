import fs from 'fs';
import path from 'path';

/**
 * Data access layer that works both locally and on Vercel.
 *
 * Problem: Vercel serverless functions have a read-only filesystem.
 * The bundled `data/` directory cannot be written to.
 *
 * Solution:
 * - On first access, copy seed data from the bundle to `/tmp/data/`
 * - All subsequent reads/writes use `/tmp/data/`
 * - Locally (non-Vercel), use the project's `data/` directory directly
 *
 * Note: `/tmp` on Vercel is ephemeral — it persists within a single
 * function instance but resets across cold starts. This is acceptable
 * for a demo/assessment app.
 */

const isVercel = !!process.env.VERCEL;
const bundleDataDir = path.join(process.cwd(), 'data');
const tmpDataDir = '/tmp/data';

function getDataDir() {
  if (!isVercel) return bundleDataDir;

  // On Vercel: ensure /tmp/data exists and seed files are copied
  if (!fs.existsSync(tmpDataDir)) {
    fs.mkdirSync(tmpDataDir, { recursive: true });
  }

  const files = ['products.json', 'warehouses.json', 'stock.json', 'transfers.json', 'alerts.json'];
  for (const file of files) {
    const tmpPath = path.join(tmpDataDir, file);
    if (!fs.existsSync(tmpPath)) {
      const bundlePath = path.join(bundleDataDir, file);
      if (fs.existsSync(bundlePath)) {
        fs.copyFileSync(bundlePath, tmpPath);
      } else {
        // Create empty array for missing files
        fs.writeFileSync(tmpPath, '[]');
      }
    }
  }

  return tmpDataDir;
}

export function getFilePath(filename) {
  return path.join(getDataDir(), filename);
}

export function readJSON(filename) {
  const filePath = getFilePath(filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function writeJSON(filename, data) {
  const filePath = getFilePath(filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
