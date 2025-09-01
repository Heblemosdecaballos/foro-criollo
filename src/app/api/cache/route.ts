
import { NextRequest, NextResponse } from 'next/server';
import redisClient from '@/lib/redis';

// GET /api/cache?key=example
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Key es requerido' },
        { status: 400 }
      );
    }

    const value = await redisClient.getCache(key);

    return NextResponse.json({
      success: true,
      key,
      value,
      found: value !== null,
      redisEnabled: redisClient.isRedisEnabled()
    });

  } catch (error) {
    console.error('❌ Error obteniendo cache:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/cache
export async function POST(request: NextRequest) {
  try {
    const { key, value, ttl = 3600 } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key y value son requeridos' },
        { status: 400 }
      );
    }

    await redisClient.setCache(key, value, ttl);

    return NextResponse.json({
      success: true,
      message: 'Cache guardado exitosamente',
      key,
      ttl,
      redisEnabled: redisClient.isRedisEnabled()
    });

  } catch (error) {
    console.error('❌ Error guardando cache:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/cache?key=example
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Key es requerido' },
        { status: 400 }
      );
    }

    const deleted = await redisClient.deleteCache(key);

    return NextResponse.json({
      success: true,
      message: deleted > 0 ? 'Cache eliminado exitosamente' : 'Cache no encontrado',
      key,
      deleted: deleted > 0,
      redisEnabled: redisClient.isRedisEnabled()
    });

  } catch (error) {
    console.error('❌ Error eliminando cache:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
