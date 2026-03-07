import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Note: This might fail if there are customers referencing this broker
    // In a real app, we might want to handle this more gracefully
    await sql`DELETE FROM brokers WHERE id = ${id}`;
    return NextResponse.json({ message: 'Broker deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
