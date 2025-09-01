
import { createClient } from 'redis';

class RedisClient {
  private client: ReturnType<typeof createClient> | null = null;
  private isConnecting = false;

  async getClient() {
    if (this.client && this.client.isOpen) {
      return this.client;
    }

    if (this.isConnecting) {
      // Esperar a que termine la conexión actual
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.client!;
    }

    this.isConnecting = true;

    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
        }
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        console.log('🔌 Redis conectado');
      });

      this.client.on('disconnect', () => {
        console.log('🔌 Redis desconectado');
      });

      await this.client.connect();
      this.isConnecting = false;
      return this.client;
    } catch (error) {
      this.isConnecting = false;
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

  // Métodos de utilidad para cache
  async setCache(key: string, value: any, ttl: number = 3600) {
    const client = await this.getClient();
    return client.setEx(key, ttl, JSON.stringify(value));
  }

  async getCache(key: string) {
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
    const client = await this.getClient();
    return client.del(key);
  }

  async setCacheHash(key: string, field: string, value: any) {
    const client = await this.getClient();
    return client.hSet(key, field, JSON.stringify(value));
  }

  async getCacheHash(key: string, field: string) {
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
