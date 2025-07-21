import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return new Response(
    `
    <html>
      <head>
        <meta property="og:title" content="Sign in with Farcaster" />
        <meta property="og:image" content="https://fa-2048.vercel.app/banner.png" />
        <meta property="og:description" content="Sign in to 2048 with your Farcaster account!" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:button:1" content="Sign in" />
        <meta property="fc:frame:post_url" content="https://fa-2048.vercel.app/api/frame" />
      </head>
      <body></body>
    </html>
    `,
    {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  return new Response(
    `
    <html>
      <head>
        <meta property="og:title" content="Signed in with Farcaster!" />
        <meta property="og:image" content="https://fa-2048.vercel.app/banner.png" />
        <meta property="og:description" content="You are now signed in to 2048 with Farcaster." />
        <meta property="fc:frame" content="vNext" />
      </head>
      <body></body>
    </html>
    `,
    {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
} 