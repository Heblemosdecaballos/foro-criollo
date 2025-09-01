
'use client';

import { useState, useEffect } from 'react';
import { useSocketContext } from '@/components/realtime/SocketProvider';
import { ConnectionStatus } from '@/components/realtime/ConnectionStatus';
import { PushNotificationButton } from '@/components/notifications/PushNotificationButton';
import { Users, Activity, Wifi, Bell, Database } from 'lucide-react';

interface SystemStats {
  connectedUsers: number;
  totalConnections: number;
  redisStatus: 'connected' | 'disconnected' | 'error' | 'disabled';
  cacheHits: number;
  cacheMisses: number;
}

export function RealtimeMonitor() {
  const { isConnected, connectedUsers } = useSocketContext();
  const [stats, setStats] = useState<SystemStats>({
    connectedUsers: 0,
    totalConnections: 0,
    redisStatus: 'disconnected',
    cacheHits: 0,
    cacheMisses: 0
  });

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Actualizar estadísticas cada 30 segundos
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/socket/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(prev => ({
            ...prev,
            ...data
          }));
        }
      } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Prueba del Sistema',
          body: 'Sistema de notificaciones funcionando correctamente',
          icon: '/icon-192x192.png',
          url: '/admin'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: `Notificación enviada a ${result.sent} usuarios`
        }]);
      }
    } catch (error) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Error enviando notificación'
      }]);
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch('/api/cache/clear', {
        method: 'POST'
      });

      if (response.ok) {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: 'Cache limpiado exitosamente'
        }]);
      }
    } catch (error) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Error limpiando cache'
      }]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Monitor en Tiempo Real
        </h2>

        {/* Estado de conexión */}
        <div className="mb-6">
          <ConnectionStatus />
        </div>

        {/* Estadísticas del sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Usuarios Conectados</p>
                <p className="text-2xl font-bold text-blue-600">{connectedUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Estado WebSocket</p>
                <p className={`text-sm font-medium ${
                  isConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Redis</p>
                <p className={`text-sm font-medium ${
                  stats.redisStatus === 'connected' ? 'text-green-600' : 
                  stats.redisStatus === 'disabled' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stats.redisStatus === 'connected' ? 'Conectado' : 
                   stats.redisStatus === 'disabled' ? 'Deshabilitado' : 'Desconectado'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.cacheHits + stats.cacheMisses > 0 
                    ? Math.round((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de administración */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={sendTestNotification}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enviar Notificación de Prueba
            </button>

            <button
              onClick={clearCache}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Limpiar Cache
            </button>
          </div>

          {/* Configuración de notificaciones push */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Configuración de Notificaciones</h3>
            <PushNotificationButton />
          </div>
        </div>

        {/* Lista de usuarios conectados */}
        {connectedUsers.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-medium mb-2">Usuarios Conectados</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {connectedUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{user.email}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notificaciones del sistema */}
        {notifications.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-medium mb-2">Notificaciones del Sistema</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.slice(-5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-2 rounded text-sm ${
                    notification.type === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {notification.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
