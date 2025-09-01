
import { NextRequest, NextResponse } from 'next/server';
import redisClient from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Datos de suscripción inválidos' },
        { status: 400 }
      );
    }

    // Intentar guardar suscripción en Redis
    const subscriptionKey = `push_subscription:${Buffer.from(subscription.endpoint).toString('base64')}`;
    const saved = await redisClient.savePushSubscription(subscriptionKey, subscription);

    if (saved) {
      console.log('✅ Nueva suscripción push guardada en Redis');
    } else {
      console.log('⚠️ Suscripción push no guardada - Redis no disponible');
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción procesada exitosamente',
      redisEnabled: redisClient.isRedisEnabled()
    });

  } catch (error) {
    console.error('❌ Error procesando suscripción push:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
