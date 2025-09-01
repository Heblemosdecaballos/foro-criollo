// STUB: Redis completamente deshabilitado para evitar errores de build
// Todas las funciones devuelven valores por defecto sin intentar conectar a Redis

class RedisClient {
  private isEnabled = false;

  constructor() {
    console.log('⚠️ Redis STUB: Redis completamente deshabilitado');
  }

  async getClient() {
    throw new Error('Redis está completamente deshabilitado');
  }

  async disconnect() {
    // No-op
  }

  isRedisEnabled(): boolean {
    return false;
  }

  // Métodos de utilidad para cache con fallback (siempre fallan silenciosamente)
  async setCache(key: string, value: any, ttl: number = 3600) {
    console.log('⚠️ Redis STUB: cache no guardado:', key);
    return 'OK'; // Simular respuesta exitosa
  }

  async getCache(key: string) {
    console.log('⚠️ Redis STUB: cache no encontrado:', key);
    return null;
  }

  async deleteCache(key: string) {
    console.log('⚠️ Redis STUB: cache no eliminado:', key);
    return 0;
  }

  async setCacheHash(key: string, field: string, value: any) {
    console.log('⚠️ Redis STUB: hash cache no guardado:', key, field);
    return 0;
  }

  async getCacheHash(key: string, field: string) {
    console.log('⚠️ Redis STUB: hash cache no encontrado:', key, field);
    return null;
  }

  async getAllCacheHash(key: string) {
    console.log('⚠️ Redis STUB: hash cache no encontrado:', key);
    return {};
  }

  // Métodos específicos para push notifications con fallback
  async savePushSubscription(subscriptionKey: string, subscription: any) {
    console.log('⚠️ Redis STUB: suscripción push no guardada');
    return false;
  }

  async getPushSubscriptions() {
    console.log('⚠️ Redis STUB: no hay suscripciones push');
    return [];
  }

  async removePushSubscription(subscriptionKey: string) {
    console.log('⚠️ Redis STUB: suscripción push no eliminada');
    return false;
  }

  async getRedisInfo() {
    return {
      status: 'disabled',
      connectedClients: 0,
      totalConnections: 0,
      cacheHits: 0,
      cacheMisses: 0,
      activeSubscriptions: 0,
      uptime: 0,
      usedMemory: '0B'
    };
  }
}

// Singleton instance
const redisClient = new RedisClient();

export default redisClient;

// Funciones de utilidad exportadas (todas son stubs)
export const setCache = (key: string, value: any, ttl?: number) => 
  redisClient.setCache(key, value, ttl);

export const getCache = (key: string) => 
  redisClient.getCache(key);

export const deleteCache = (key: string) => 
  redisClient.deleteCache(key);

export const setCacheHash = (key: string, field: string, value: any) => 
  redisClient.setCacheHash(key, field, value);

export const getCacheHash = (key: string, field: string) => 
  redisClient.getCacheHash(key, field);

export const getAllCacheHash = (key: string) => 
  redisClient.getAllCacheHash(key);

export const isRedisEnabled = () => redisClient.isRedisEnabled();
