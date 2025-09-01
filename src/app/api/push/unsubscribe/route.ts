
import { NextRequest, NextResponse } from 'next/server';
import redisClient from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint es requerido' },
        { status: 400 }
      );
    }

    // Eliminar suscripción de Redis
    const subscriptionKey = `push_subscription:${Buffer.from(endpoint).toString('base64')}`;
    const removed = await redisClient.removePushSubscription(subscriptionKey);

    if (removed) {
      console.log('✅ Suscripción push eliminada de Redis');
    } else {
      console.log('⚠️ Suscripción push no eliminada - Redis no disponible');
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción procesada exitosamente',
      redisEnabled: redisClient.isRedisEnabled()
    });

  } catch (error) {
    console.error('❌ Error eliminando suscripción push:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
