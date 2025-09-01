
import { NextRequest, NextResponse } from 'next/server';
import redisClient from '@/lib/redis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (!key) {
    return NextResponse.json({ error: 'Key parameter required' }, { status: 400 });
  }

  try {
    const value = await redisClient.getCache(key);
    return NextResponse.json({ key, value, found: value !== null });
  } catch (error) {
    console.error('❌ Error obteniendo cache:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, value, ttl = 3600 } = await request.json();
    
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value required' }, { status: 400 });
    }

    await redisClient.setCache(key, value, ttl);
    return NextResponse.json({ success: true, key, ttl });
  } catch (error) {
    console.error('❌ Error guardando cache:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (!key) {
    return NextResponse.json({ error: 'Key parameter required' }, { status: 400 });
  }

  try {
    const deleted = await redisClient.deleteCache(key);
    return NextResponse.json({ success: true, deleted: deleted > 0 });
  } catch (error) {
    console.error('❌ Error eliminando cache:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
