import type { SocialSnapshot } from '@/types';
import socialData from '../../data/social.json';

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function loadSocialData(): Promise<SocialSnapshot | null> {
  return cloneJson(socialData as SocialSnapshot | null);
}
