
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';
import webpush from 'web-push';

// Configurar VAPID
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

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
    const notificationData = await request.json();
    
    if (!notificationData.title || !notificationData.body) {
      return NextResponse.json(
        { error: 'Título y cuerpo son requeridos' },
        { status: 400 }
      );
    }

    await ensureRedisConnection();

    // Obtener todas las suscripciones activas
    const subscriptionKeys = await redis.smembers('active_push_subscriptions') as string[];
    
    if (!subscriptionKeys || subscriptionKeys.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay suscripciones activas',
        sent: 0
      });
    }

    const payload = JSON.stringify({
      title: notificationData.title,
      body: notificationData.body,
      icon: notificationData.icon || '/icon-192x192.png',
      badge: notificationData.badge || '/icon-192x192.png',
      tag: notificationData.tag || 'general',
      data: {
        url: notificationData.url || '/',
        timestamp: new Date().toISOString()
      }
    });

    let successCount = 0;
    let failureCount = 0;

    // Enviar notificaciones a todas las suscripciones
    const sendPromises = subscriptionKeys.map(async (key: string) => {
      try {
        const subscriptionData = await redis.get(key);
        if (!subscriptionData) {
          // Limpiar clave inválida
          await redis.srem('active_push_subscriptions', key);
          return;
        }

        const subscription = JSON.parse(subscriptionData);
        
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys
          },
          payload
        );
        
        successCount++;
      } catch (error: any) {
        failureCount++;
        console.error(`❌ Error enviando push a ${key}:`, error.message);
        
        // Si la suscripción es inválida (410 Gone), eliminarla
        if (error.statusCode === 410) {
          await redis.del(key);
          await redis.srem('active_push_subscriptions', key);
        }
      }
    });

    await Promise.all(sendPromises);

    console.log(`📱 Notificaciones enviadas: ${successCount} exitosas, ${failureCount} fallidas`);

    return NextResponse.json({
      success: true,
      message: 'Notificaciones procesadas',
      sent: successCount,
      failed: failureCount
    });

  } catch (error) {
    console.error('❌ Error enviando notificaciones push:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
