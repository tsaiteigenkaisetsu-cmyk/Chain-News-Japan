export const dynamic = 'force-static';

function getAdsTxtBody() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  if (!client?.startsWith('ca-pub-')) {
    return '';
  }

  const publisherId = client.replace(/^ca-/, '');
  return `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`;
}

export async function GET() {
  const body = getAdsTxtBody();

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  });
}