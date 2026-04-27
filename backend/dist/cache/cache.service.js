"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let CacheService = CacheService_1 = class CacheService {
    config;
    logger = new common_1.Logger(CacheService_1.name);
    client = null;
    constructor(config) {
        this.config = config;
        const host = config.get('REDIS_HOST', '');
        const port = config.get('REDIS_PORT', 6380);
        const password = config.get('REDIS_PASSWORD', '');
        const tls = config.get('REDIS_TLS', 'false') === 'true';
        if (host) {
            this.client = new ioredis_1.default({ host, port, password, tls: tls ? {} : undefined });
            this.client.on('error', (err) => this.logger.error('Redis error', err));
        }
        else {
            this.logger.warn('Redis not configured — caching disabled');
        }
    }
    async get(key) {
        if (!this.client)
            return null;
        try {
            const val = await this.client.get(key);
            return val ? JSON.parse(val) : null;
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttlSeconds = 300) {
        if (!this.client)
            return;
        try {
            await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        }
        catch (err) {
            this.logger.warn(`Cache set failed for ${key}`, err);
        }
    }
    async del(...keys) {
        if (!this.client || keys.length === 0)
            return;
        try {
            await this.client.del(...keys);
        }
        catch (err) {
            this.logger.warn('Cache del failed', err);
        }
    }
    async delByPattern(pattern) {
        if (!this.client)
            return;
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0)
                await this.client.del(...keys);
        }
        catch (err) {
            this.logger.warn(`Cache pattern del failed for ${pattern}`, err);
        }
    }
    onModuleDestroy() {
        this.client?.disconnect();
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CacheService);
//# sourceMappingURL=cache.service.js.map