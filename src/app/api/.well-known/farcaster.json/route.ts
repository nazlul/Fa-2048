import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return new Response(null, {
    status: 307,
    headers: {
      Location: 'https://api.farcaster.xyz/miniapps/hosted-manifest/01982bca-3c94-fb3e-3a5c-b325f6fa1961',
    },
  });
} 