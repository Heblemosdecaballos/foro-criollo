
import { NextResponse } from 'next/server';
import redisClient from '@/lib/redis';

export async function GET() {
  try {
    // Obtener estadísticas de Redis
    const client = await redisClient.getClient();
    const info = await client.info();
    
    // Parsear información de Redis
    const lines = info.split('\r\n');
    const stats: Record<string, any> = {};
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key] = value;
      }
    });

    // Obtener suscripciones activas
    const activeSubscriptions = await client.scard('active_push_subscriptions');
    
    return NextResponse.json({
      redisStatus: 'connected',
      connectedClients: parseInt(stats.connected_clients || '0'),
      totalConnections: parseInt(stats.total_connections_received || '0'),
      cacheHits: parseInt(stats.keyspace_hits || '0'),
      cacheMisses: parseInt(stats.keyspace_misses || '0'),
      activeSubscriptions,
      uptime: parseInt(stats.uptime_in_seconds || '0'),
      usedMemory: stats.used_memory_human || '0B'
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return NextResponse.json({
      redisStatus: 'error',
      connectedClients: 0,
      totalConnections: 0,
      cacheHits: 0,
      cacheMisses: 0,
      activeSubscriptions: 0,
      uptime: 0,
      usedMemory: '0B'
    });
  }
}
