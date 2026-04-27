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
exports.PostsRepository = void 0;
const common_1 = require("@nestjs/common");
const cosmos_1 = require("@azure/cosmos");
const database_module_1 = require("../database/database.module");
const uuid_1 = require("uuid");
let PostsRepository = class PostsRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    get container() { return this.db.container('posts'); }
    async create(data) {
        const now = new Date().toISOString();
        const post = { id: (0, uuid_1.v4)(), likeCount: 0, commentCount: 0, saveCount: 0, createdAt: now, updatedAt: now, ...data };
        const { resource } = await this.container.items.create(post);
        return resource;
    }
    async findById(id, creatorId) {
        try {
            const { resource } = await this.container.item(id, creatorId).read();
            return resource ?? null;
        }
        catch {
            return null;
        }
    }
    async findByIdAny(id) {
        const { resources } = await this.container.items
            .query({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: id }] })
            .fetchAll();
        return resources[0] ?? null;
    }
    async findByUser(creatorId, limit = 20, offset = 0) {
        const { resources } = await this.container.items
            .query({
            query: 'SELECT * FROM c WHERE c.creatorId = @cid ORDER BY c.createdAt DESC OFFSET @off LIMIT @lim',
            parameters: [{ name: '@cid', value: creatorId }, { name: '@off', value: offset }, { name: '@lim', value: limit }],
        })
            .fetchAll();
        return resources;
    }
    async findByCreatorIds(creatorIds, limit = 20, offset = 0) {
        if (creatorIds.length === 0)
            return [];
        const params = creatorIds.map((id, i) => ({ name: `@id${i}`, value: id }));
        const inClause = params.map((p) => p.name).join(',');
        const { resources } = await this.container.items
            .query({
            query: `SELECT * FROM c WHERE c.creatorId IN (${inClause}) ORDER BY c.createdAt DESC OFFSET @off LIMIT @lim`,
            parameters: [...params, { name: '@off', value: offset }, { name: '@lim', value: limit }],
        })
            .fetchAll();
        return resources;
    }
    async findRecent(limit = 20, offset = 0) {
        const { resources } = await this.container.items
            .query({
            query: 'SELECT * FROM c ORDER BY c.createdAt DESC OFFSET @off LIMIT @lim',
            parameters: [{ name: '@off', value: offset }, { name: '@lim', value: limit }],
        })
            .fetchAll();
        return resources;
    }
    async update(id, creatorId, data) {
        const existing = await this.findById(id, creatorId);
        const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
        const { resource } = await this.container.items.upsert(updated);
        return resource;
    }
    async delete(id, creatorId) {
        await this.container.item(id, creatorId).delete();
    }
    async incrementCounter(id, creatorId, field, delta) {
        const post = await this.findById(id, creatorId);
        if (!post)
            return;
        await this.container.items.upsert({ ...post, [field]: Math.max(0, (post[field] || 0) + delta) });
    }
    async search(q, limit = 20) {
        const { resources } = await this.container.items
            .query({
            query: `SELECT * FROM c WHERE CONTAINS(LOWER(c.caption), @q) OR CONTAINS(LOWER(c.location), @q) OFFSET 0 LIMIT @limit`,
            parameters: [{ name: '@q', value: q.toLowerCase() }, { name: '@limit', value: limit }],
        })
            .fetchAll();
        return resources;
    }
};
exports.PostsRepository = PostsRepository;
exports.PostsRepository = PostsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.COSMOS_DB)),
    __metadata("design:paramtypes", [cosmos_1.Database])
], PostsRepository);
//# sourceMappingURL=posts.repository.js.map