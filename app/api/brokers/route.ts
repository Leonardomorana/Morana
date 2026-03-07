import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM brokers ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, phone, company, password, status } = body;

    await sql`
      INSERT INTO brokers (id, name, email, phone, company, password, status)
      VALUES (${id}, ${name}, ${email}, ${phone}, ${company}, ${password}, ${status})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        company = EXCLUDED.company,
        password = EXCLUDED.password,
        status = EXCLUDED.status
    `;

    return NextResponse.json({ message: 'Broker saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
