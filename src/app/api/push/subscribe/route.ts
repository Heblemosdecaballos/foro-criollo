
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Conectar a Redis si no está conectado
async function ensureRedisConnection() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Datos de suscripción inválidos' },
        { status: 400 }
      );
    }

    await ensureRedisConnection();

    // Guardar suscripción en Redis
    const subscriptionKey = `push_subscription:${Buffer.from(subscription.endpoint).toString('base64')}`;
    await redis.setex(subscriptionKey, 86400 * 30, JSON.stringify({
      ...subscription,
      subscribedAt: new Date().toISOString()
    })); // Expira en 30 días

    // Agregar a lista de suscripciones activas
    await redis.sadd('active_push_subscriptions', subscriptionKey);

    console.log('✅ Nueva suscripción push guardada');

    return NextResponse.json({
      success: true,
      message: 'Suscripción guardada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error guardando suscripción push:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
