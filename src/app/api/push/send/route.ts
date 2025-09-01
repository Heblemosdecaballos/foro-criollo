
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import redisClient from '@/lib/redis';

// Configurar VAPID keys
webpush.setVapidDetails(
  'mailto:admin@hablandodecaballos.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { title, body, icon, url } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Título y cuerpo son requeridos' },
        { status: 400 }
      );
    }

    // Obtener suscripciones desde Redis
    const subscriptions = await redisClient.getPushSubscriptions();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay suscripciones activas',
        sent: 0,
        redisEnabled: redisClient.isRedisEnabled()
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192x192.png',
      url: url || '/',
      timestamp: Date.now()
    });

    let sentCount = 0;
    const failedSubscriptions: string[] = [];

    // Enviar notificaciones
    for (const { key, data } of subscriptions) {
      try {
        await webpush.sendNotification(data, payload);
        sentCount++;
      } catch (error: any) {
        console.error('❌ Error enviando notificación:', error);
        
        // Si la suscripción es inválida, eliminarla
        if (error.statusCode === 410 || error.statusCode === 404) {
          failedSubscriptions.push(key);
        }
      }
    }

    // Limpiar suscripciones inválidas
    for (const key of failedSubscriptions) {
      await redisClient.removePushSubscription(key);
    }

    console.log(`✅ Notificaciones enviadas: ${sentCount}/${subscriptions.length}`);

    return NextResponse.json({
      success: true,
      message: `Notificación enviada a ${sentCount} usuarios`,
      sent: sentCount,
      total: subscriptions.length,
      cleaned: failedSubscriptions.length,
      redisEnabled: redisClient.isRedisEnabled()
    });

  } catch (error) {
    console.error('❌ Error enviando notificaciones push:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
