
'use client';

import { useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellOff, Loader2 } from 'lucide-react';

export function PushNotificationButton() {
  const {
    permission,
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications();

  const [showTest, setShowTest] = useState(false);

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500">
        Notificaciones no soportadas en este navegador
      </div>
    );
  }

  const handleToggleSubscription = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      const success = await subscribe();
      if (success) {
        setShowTest(true);
        setTimeout(() => setShowTest(false), 3000);
      }
    }
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleToggleSubscription}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isSubscribed
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSubscribed ? (
          <BellOff className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        
        {isLoading ? (
          'Procesando...'
        ) : isSubscribed ? (
          'Desactivar notificaciones'
        ) : (
          'Activar notificaciones'
        )}
      </button>

      {/* Botón de prueba */}
      {showTest && isSubscribed && (
        <button
          onClick={handleTestNotification}
          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
        >
          Enviar notificación de prueba
        </button>
      )}

      {/* Estado del permiso */}
      <div className="text-xs text-gray-500">
        Estado: {permission === 'granted' ? 'Permitido' : 
                permission === 'denied' ? 'Denegado' : 'Pendiente'}
      </div>
    </div>
  );
}
