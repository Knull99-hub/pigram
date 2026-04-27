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
exports.FollowsRepository = void 0;
const common_1 = require("@nestjs/common");
const cosmos_1 = require("@azure/cosmos");
const database_module_1 = require("../database/database.module");
const uuid_1 = require("uuid");
let FollowsRepository = class FollowsRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    get container() { return this.db.container('follows'); }
    async create(followerId, followingId) {
        const doc = { id: (0, uuid_1.v4)(), followerId, followingId, createdAt: new Date().toISOString() };
        const { resource } = await this.container.items.create(doc);
        return resource;
    }
    async find(followerId, followingId) {
        const { resources } = await this.container.items
            .query({
            query: 'SELECT * FROM c WHERE c.followerId = @fid AND c.followingId = @tid',
            parameters: [{ name: '@fid', value: followerId }, { name: '@tid', value: followingId }],
        })
            .fetchAll();
        return resources[0] ?? null;
    }
    async delete(followerId, followingId) {
        const existing = await this.find(followerId, followingId);
        if (existing)
            await this.container.item(existing.id, followerId).delete();
    }
    async getFollowerIds(userId) {
        const { resources } = await this.container.items
            .query({ query: 'SELECT * FROM c WHERE c.followingId = @uid', parameters: [{ name: '@uid', value: userId }] })
            .fetchAll();
        return resources.map((f) => f.followerId);
    }
    async getFollowingIds(userId) {
        const { resources } = await this.container.items
            .query({ query: 'SELECT * FROM c WHERE c.followerId = @uid', parameters: [{ name: '@uid', value: userId }] })
            .fetchAll();
        return resources.map((f) => f.followingId);
    }
};
exports.FollowsRepository = FollowsRepository;
exports.FollowsRepository = FollowsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.COSMOS_DB)),
    __metadata("design:paramtypes", [cosmos_1.Database])
], FollowsRepository);
//# sourceMappingURL=follows.repository.js.map