import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error("BACKEND_URL is not defined");
      return NextResponse.json({ error: "Backend configuration error" }, { status: 500 });
    }

    const response = await fetch(`${backendUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${response.status} ${errorText}`);
      return NextResponse.json({ error: `Backend error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}
