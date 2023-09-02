import { NextResponse } from 'next/server';

import { NextApiRequest, NextApiResponse } from 'next';

export async function GET(req: Request) {
  const res = await fetch('https://api.chucknorris.io/jokes/random', {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  return NextResponse.json({ data });
}
