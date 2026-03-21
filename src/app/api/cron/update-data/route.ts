import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_OWNER = 'tsaiteigenkaisetsu-cmyk';
const DEFAULT_REPO = 'Chain-News-Japan';
const DEFAULT_WORKFLOW = 'update-data.yml';
const DEFAULT_REF = 'main';

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;

  const { searchParams } = new URL(request.url);
  return searchParams.get('secret') === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.GITHUB_ACTIONS_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'Missing GITHUB_ACTIONS_DISPATCH_TOKEN' },
      { status: 500 },
    );
  }

  const owner = process.env.GITHUB_REPO_OWNER ?? DEFAULT_OWNER;
  const repo = process.env.GITHUB_REPO_NAME ?? DEFAULT_REPO;
  const workflow = process.env.GITHUB_UPDATE_DATA_WORKFLOW ?? DEFAULT_WORKFLOW;
  const ref = process.env.GITHUB_UPDATE_DATA_REF ?? DEFAULT_REF;

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Chain-News-Japan-Cron-Dispatcher',
      },
      body: JSON.stringify({ ref }),
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: 'Failed to dispatch workflow', detail },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, owner, repo, workflow, ref, triggeredAt: new Date().toISOString() });
}