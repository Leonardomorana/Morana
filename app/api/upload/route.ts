import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ 
      error: 'Configuração ausente: BLOB_READ_WRITE_TOKEN não encontrado. Por favor, configure a variável de ambiente no painel da Vercel ou no AI Studio.' 
    }, { status: 500 });
  }

  try {
    const blob = await put(filename, request.body!, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error('Upload error:', error);
    let errorMessage = error.message || 'Failed to upload file';
    
    if (errorMessage.includes('private store')) {
      errorMessage = 'Erro de Configuração: Seu Vercel Blob está configurado como "Private". No painel da Vercel, altere as configurações do Blob para "Public" ou entre em contato com o suporte.';
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
