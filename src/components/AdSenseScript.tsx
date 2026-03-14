import Script from 'next/script';

const ADSENSE_CLIENT_RE = /^ca-pub-\d{10,20}$/;

export default function AdSenseScript() {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  if (!adsenseClient || !ADSENSE_CLIENT_RE.test(adsenseClient)) {
    return null;
  }

  return (
    <Script
      id="adsense-verification"
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
      strategy="beforeInteractive"
    />
  );
}