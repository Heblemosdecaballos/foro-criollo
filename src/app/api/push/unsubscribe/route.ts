
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

async function ensureRedisConnection() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint requerido' },
        { status: 400 }
      );
    }

    await ensureRedisConnection();

    // Eliminar suscripción de Redis
    const subscriptionKey = `push_subscription:${Buffer.from(endpoint).toString('base64')}`;
    await redis.del(subscriptionKey);
    await redis.srem('active_push_subscriptions', subscriptionKey);

    console.log('✅ Suscripción push eliminada');

    return NextResponse.json({
      success: true,
      message: 'Desuscripción exitosa'
    });

  } catch (error) {
    console.error('❌ Error eliminando suscripción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
