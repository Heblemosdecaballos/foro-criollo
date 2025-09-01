
'use client';

import { useSocketContext } from './SocketProvider';
import { Wifi, WifiOff, Users } from 'lucide-react';

export function ConnectionStatus() {
  const { isConnected, connectedUsers } = useSocketContext();

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Estado de conexión */}
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
        isConnected 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>Conectado</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Desconectado</span>
          </>
        )}
      </div>

      {/* Usuarios conectados */}
      {isConnected && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700">
          <Users className="w-3 h-3" />
          <span>{connectedUsers.length} online</span>
        </div>
      )}
    </div>
  );
}
