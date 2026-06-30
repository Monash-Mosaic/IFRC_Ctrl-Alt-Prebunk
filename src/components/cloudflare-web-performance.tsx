import Script from 'next/script';

const beaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export default function CloudflareWebPerformance() {
  if (!beaconToken) {
    return null;
  }

  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: beaconToken, spa: true })}
      strategy="afterInteractive"
    />
  );
}
