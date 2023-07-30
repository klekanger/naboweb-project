import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const res = await fetch('https://api.chucknorris.io/jokes/random', {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 10 },
  });
  const data = await res.json();
  const { value } = data;

  return NextResponse.json({ data });
}
