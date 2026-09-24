import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

// Armazenamento local em disco (grátis, sem conta). Servido em /uploads.
export const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

function normalizeKey(relKey: string): string {
  const key = relKey.replace(/^\/+/, "");
  if (key.split(/[\\/]/).includes("..")) {
    throw new Error("Invalid storage key");
  }
  return key;
}

function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const filePath = path.join(UPLOADS_DIR, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, data);
  return { key, url: `/uploads/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/uploads/${key}` };
}
