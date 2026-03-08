import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ 
      error: 'Configuração ausente: POSTGRES_URL não encontrada. Certifique-se de que o banco de dados Postgres está vinculado ao projeto no painel da Vercel.' 
    }, { status: 500 });
  }

  try {
    // Create brokers table
    await sql`
      CREATE TABLE IF NOT EXISTS brokers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        company TEXT,
        password TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create customers table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cpf TEXT NOT NULL,
        income NUMERIC NOT NULL,
        project TEXT NOT NULL,
        unit TEXT NOT NULL,
        property_value NUMERIC NOT NULL,
        financed_value NUMERIC NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        analyst TEXT,
        broker_id TEXT REFERENCES brokers(id),
        broker_name TEXT,
        documents JSONB DEFAULT '[]',
        status_history JSONB DEFAULT '[]'
      );
    `;

    return NextResponse.json({ message: 'Database tables created successfully' });
  } catch (error: any) {
    console.error('Database setup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
