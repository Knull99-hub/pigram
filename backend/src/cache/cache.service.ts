import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;

  constructor(private config: ConfigService) {
    const host = config.get<string>('REDIS_HOST', '');
    const port = config.get<number>('REDIS_PORT', 6380);
    const password = config.get<string>('REDIS_PASSWORD', '');
    const tls = config.get<string>('REDIS_TLS', 'false') === 'true';

    if (host) {
      this.client = new Redis({ host, port, password, tls: tls ? {} : undefined });
      this.client.on('error', (err) => this.logger.error('Redis error', err));
    } else {
      this.logger.warn('Redis not configured — caching disabled');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const val = await this.client.get(key);
      return val ? (JSON.parse(val) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      this.logger.warn(`Cache set failed for ${key}`, err);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.client || keys.length === 0) return;
    try {
      await this.client.del(...keys);
    } catch (err) {
      this.logger.warn('Cache del failed', err);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    if (!this.client) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) await this.client.del(...keys);
    } catch (err) {
      this.logger.warn(`Cache pattern del failed for ${pattern}`, err);
    }
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }
}
