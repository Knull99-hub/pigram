import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class CacheService implements OnModuleDestroy {
    private config;
    private readonly logger;
    private client;
    constructor(config: ConfigService);
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    del(...keys: string[]): Promise<void>;
    delByPattern(pattern: string): Promise<void>;
    onModuleDestroy(): void;
}
