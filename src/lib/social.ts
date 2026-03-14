import type { SocialSnapshot } from '@/types';

const DATA_DIR = process.env.DATA_DIR ?? './data';

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    const { readFile } = await import('fs/promises');
    const path = await import('path');
    const fullPath = path.join(process.cwd(), DATA_DIR, filename);
    const raw = await readFile(fullPath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function loadSocialData(): Promise<SocialSnapshot | null> {
  return readJson<SocialSnapshot | null>('social.json', null);
}
