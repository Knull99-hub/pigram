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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const cosmos_1 = require("@azure/cosmos");
const database_module_1 = require("../database/database.module");
const uuid_1 = require("uuid");
let UsersRepository = class UsersRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    get container() {
        return this.db.container('users');
    }
    async create(data) {
        const user = {
            ...data,
            id: (0, uuid_1.v4)(),
            avatarUrl: data.avatarUrl || '',
            bio: data.bio || '',
            website: data.website || '',
            location: data.location || '',
            followerCount: 0,
            followingCount: 0,
            postCount: 0,
            createdAt: new Date().toISOString(),
        };
        const { resource } = await this.container.items.create(user);
        return resource;
    }
    async findById(id) {
        try {
            const { resource } = await this.container.item(id, id).read();
            return resource ?? null;
        }
        catch {
            return null;
        }
    }
    async findByEmail(email) {
        const { resources } = await this.container.items
            .query({ query: 'SELECT * FROM c WHERE c.email = @email', parameters: [{ name: '@email', value: email }] })
            .fetchAll();
        return resources[0] ?? null;
    }
    async findByUsername(username) {
        const { resources } = await this.container.items
            .query({ query: 'SELECT * FROM c WHERE c.username = @username', parameters: [{ name: '@username', value: username }] })
            .fetchAll();
        return resources[0] ?? null;
    }
    async update(id, data) {
        const existing = await this.findById(id);
        const updated = { ...existing, ...data };
        const { resource } = await this.container.items.upsert(updated);
        return resource;
    }
    async incrementCounter(id, field, delta) {
        const user = await this.findById(id);
        if (!user)
            return;
        await this.container.items.upsert({ ...user, [field]: Math.max(0, (user[field] || 0) + delta) });
    }
    async search(q, limit = 20) {
        const { resources } = await this.container.items
            .query({
            query: `SELECT * FROM c WHERE CONTAINS(LOWER(c.username), @q) OR CONTAINS(LOWER(c.displayName), @q) OFFSET 0 LIMIT @limit`,
            parameters: [{ name: '@q', value: q.toLowerCase() }, { name: '@limit', value: limit }],
        })
            .fetchAll();
        return resources;
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.COSMOS_DB)),
    __metadata("design:paramtypes", [cosmos_1.Database])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map