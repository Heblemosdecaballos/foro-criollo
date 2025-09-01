
import { createClient } from 'redis';

class RedisClient {
  private client: ReturnType<typeof createClient> | null = null;
  private isConnecting = false;
  private isEnabled = false;

  constructor() {
    // Solo habilitar Redis si la URL está configurada y no estamos en build time
    this.isEnabled = !!(process.env.REDIS_URL && typeof window === 'undefined' && process.env.NODE_ENV !== 'test');
  }

  async getClient() {
    if (!this.isEnabled) {
      throw new Error('Redis no está habilitado o disponible');
    }

    if (this.client && this.client.isOpen) {
      return this.client;
    }

    if (this.isConnecting) {
      // Esperar a que termine la conexión actual
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (!this.client) {
        throw new Error('Error conectando a Redis');
      }
      return this.client;
    }

    this.isConnecting = true;

    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
          connectTimeout: 5000,
        }
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
        this.isEnabled = false;
      });

      this.client.on('connect', () => {
        console.log('🔌 Redis conectado');
        this.isEnabled = true;
      });

      this.client.on('disconnect', () => {
        console.log('🔌 Redis desconectado');
      });

      await this.client.connect();
      this.isConnecting = false;
      return this.client;
    } catch (error) {
      this.isConnecting = false;
      this.isEnabled = false;
      console.error('❌ Error conectando a Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.client.isOpen) {
      await this.client.disconnect();
      this.client = null;
    }
  }

  isRedisEnabled(): boolean {
    return this.isEnabled;
  }

  // Métodos de utilidad para cache con fallback
  async setCache(key: string, value: any, ttl: number = 3600) {
    if (!this.isEnabled) {
      console.log('⚠️ Redis no disponible, cache no guardado:', key);
      return 'OK'; // Simular respuesta exitosa
    }

    try {
      const client = await this.getClient();
      return client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('❌ Error guardando cache:', error);
      return null;
    }
  }

  async getCache(key: string) {
    if (!this.isEnabled) {
      console.log('⚠️ Redis no disponible, cache no encontrado:', key);
      return null;
    }

    try {
      const client = await this.getClient();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('❌ Error obteniendo cache:', error);
      return null;
    }
  }

  async deleteCache(key: string) {
    if (!this.isEnabled) {
      console.log('⚠️ Redis no disponible, cache no eliminado:', key);
      return 0;
    }

    try {
      const client = await this.getClient();
      return client.del(key);
    } catch (error) {
      console.error('❌ Error eliminando cache:', error);
      return 0;
    }
  }

  async setCacheHash(key: string, field: string, value: any) {
    if (!this.isEnabled) {
      console.log('⚠️ Redis no disponible, hash cache no guardado:', key, field);
      return 0;
    }

    try {
      const client = await this.getClient();
      return client.hSet(key, field, JSON.stringify(value));
    } catch (error) {
      console.error('❌ Error guardando hash cache:', error);
      return 0;
    }
  }

  async getCacheHash(key: string, field: string) {
    if (!this.isEnabled) {
      console.log('⚠️ Redis no disponible, hash cache no encontrado:', key, field);
      return null;
    }

    try {
      const client = await this.getClient();
      const value = await client.hGet(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('❌ Error obteniendo hash cache:', error);
      return null;
    }
  }

  async getAllCacheHash(key: string) {
    if (!this.isEnabled) {
      console.log('⚠️ Redis no disponible, hash cache no encontrado:', key);
      return {};
    }

    try {
      const client = await this.getClient();
      const hash = await client.hGetAll(key);
      const result: Record<string, any> = {};
      
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error obteniendo todo el hash cache:', error);
      return {};
    }
  }

  // Métodos específicos para push notifications con fallback
  async savePushSubscription(subscriptionKey: string, subscription: any) {
    if (!this.isEnabled) {
      console.log('⚠️ Redis no disponible, suscripción push no guardada');
      return false;
    }

    try {
      const client = await this.getClient();
      await client.setEx(subscriptionKey, 86400 * 30, JSON.stringify({
        ...subscription,
        subscribedAt: new Date().toISOString()
      }));
      await client.sAdd('active_push_subscriptions', subscriptionKey);
      return true;
    } catch (error) {
      console.error('❌ Error guardando suscripción push:', error);
      return false;
    }
  }

  async getPushSubscriptions() {
    if (!this.isEnabled) {
      console.log('⚠️ Redis no disponible, no hay suscripciones push');
      return [];
    }

    try {
      const client = await this.getClient();
      const subscriptionKeys = await client.sMembers('active_push_subscriptions');
      const subscriptions = [];

      for (const key of subscriptionKeys) {
        try {
          const subscriptionData = await client.get(key);
          if (subscriptionData) {
            subscriptions.push({
              key,
              data: JSON.parse(subscriptionData)
            });
          }
        } catch (error) {
          console.error('❌ Error obteniendo suscripción:', key, error);
        }
      }

      return subscriptions;
    } catch (error) {
      console.error('❌ Error obteniendo suscripciones push:', error);
      return [];
    }
  }

  async removePushSubscription(subscriptionKey: string) {
    if (!this.isEnabled) {
      console.log('⚠️ Redis no disponible, suscripción push no eliminada');
      return false;
    }

    try {
      const client = await this.getClient();
      await client.del(subscriptionKey);
      await client.sRem('active_push_subscriptions', subscriptionKey);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando suscripción push:', error);
      return false;
    }
  }

  async getRedisInfo() {
    if (!this.isEnabled) {
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

    try {
      const client = await this.getClient();
      const info = await client.info();
      const activeSubscriptions = await client.sCard('active_push_subscriptions');
      
      const lines = info.split('\r\n');
      const stats: Record<string, any> = {};
      
      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          stats[key] = value;
        }
      });

      return {
        status: 'connected',
        connectedClients: parseInt(stats.connected_clients || '0'),
        totalConnections: parseInt(stats.total_connections_received || '0'),
        cacheHits: parseInt(stats.keyspace_hits || '0'),
        cacheMisses: parseInt(stats.keyspace_misses || '0'),
        activeSubscriptions,
        uptime: parseInt(stats.uptime_in_seconds || '0'),
        usedMemory: stats.used_memory_human || '0B'
      };
    } catch (error) {
      console.error('❌ Error obteniendo info de Redis:', error);
      return {
        status: 'error',
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
}

// Singleton instance
const redisClient = new RedisClient();

export default redisClient;

// Funciones de utilidad exportadas
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
