
import { NextResponse } from 'next/server';
import redisClient from '@/lib/redis';

export async function GET() {
  try {
    const redisInfo = await redisClient.getRedisInfo();
    
    return NextResponse.json({
      redisStatus: redisInfo.status,
      connectedClients: redisInfo.connectedClients,
      totalConnections: redisInfo.totalConnections,
      cacheHits: redisInfo.cacheHits,
      cacheMisses: redisInfo.cacheMisses,
      activeSubscriptions: redisInfo.activeSubscriptions,
      uptime: redisInfo.uptime,
      usedMemory: redisInfo.usedMemory
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
