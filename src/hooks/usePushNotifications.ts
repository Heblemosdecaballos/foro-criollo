
'use client';

import { useState, useEffect } from 'react';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verificar soporte para notificaciones
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission as NotificationPermission);
      checkExistingSubscription();
    }
  }, []);

  // Verificar suscripción existente
  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription({
          endpoint: existingSubscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(existingSubscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(existingSubscription.getKey('auth')!)
          }
        });
      }
    } catch (error) {
      console.error('❌ Error verificando suscripción:', error);
    }
  };

  // Solicitar permiso para notificaciones
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('⚠️ Notificaciones push no soportadas');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission as NotificationPermission);
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Error solicitando permiso:', error);
      return false;
    }
  };

  // Suscribirse a notificaciones push
  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setIsLoading(true);

    try {
      // Registrar service worker si no está registrado
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        await navigator.serviceWorker.ready;
      }

      // Crear suscripción push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        )
      });

      const subscriptionData = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(pushSubscription.getKey('auth')!)
        }
      };

      // Enviar suscripción al servidor
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });

      if (response.ok) {
        setSubscription(subscriptionData);
        console.log('✅ Suscripción a push notifications exitosa');
        return true;
      } else {
        throw new Error('Error enviando suscripción al servidor');
      }
    } catch (error) {
      console.error('❌ Error suscribiéndose a push:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Desuscribirse de notificaciones
  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription) return true;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.getSubscription();
      
      if (pushSubscription) {
        await pushSubscription.unsubscribe();
      }

      // Notificar al servidor
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });

      setSubscription(null);
      console.log('✅ Desuscripción exitosa');
      return true;
    } catch (error) {
      console.error('❌ Error desuscribiéndose:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar notificación de prueba
  const sendTestNotification = async () => {
    if (!subscription) return;

    try {
      await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Notificación de Prueba',
          body: '¡Las notificaciones están funcionando correctamente!',
          icon: '/icon-192x192.png',
          url: '/'
        })
      });
    } catch (error) {
      console.error('❌ Error enviando notificación de prueba:', error);
    }
  };

  return {
    permission,
    isSupported,
    subscription,
    isLoading,
    isSubscribed: !!subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
}

// Utilidades
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
