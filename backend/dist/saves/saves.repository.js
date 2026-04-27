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
exports.SavesRepository = void 0;
const common_1 = require("@nestjs/common");
const cosmos_1 = require("@azure/cosmos");
const database_module_1 = require("../database/database.module");
const uuid_1 = require("uuid");
let SavesRepository = class SavesRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    get container() { return this.db.container('saves'); }
    async create(postId, userId) {
        const doc = { id: (0, uuid_1.v4)(), postId, userId, createdAt: new Date().toISOString() };
        const { resource } = await this.container.items.create(doc);
        return resource;
    }
    async find(postId, userId) {
        const { resources } = await this.container.items
            .query({ query: 'SELECT * FROM c WHERE c.postId = @pid AND c.userId = @uid', parameters: [{ name: '@pid', value: postId }, { name: '@uid', value: userId }] })
            .fetchAll();
        return resources[0] ?? null;
    }
    async delete(postId, userId) {
        const save = await this.find(postId, userId);
        if (save)
            await this.container.item(save.id, userId).delete();
    }
    async getSavedPostIds(userId) {
        const { resources } = await this.container.items
            .query({ query: 'SELECT * FROM c WHERE c.userId = @uid ORDER BY c.createdAt DESC', parameters: [{ name: '@uid', value: userId }] })
            .fetchAll();
        return resources.map((s) => s.postId);
    }
    async getSavedPostIdsForPosts(userId, postIds) {
        if (postIds.length === 0)
            return [];
        const params = postIds.map((id, i) => ({ name: `@id${i}`, value: id }));
        const inClause = params.map((p) => p.name).join(',');
        const { resources } = await this.container.items
            .query({ query: `SELECT * FROM c WHERE c.userId = @uid AND c.postId IN (${inClause})`, parameters: [{ name: '@uid', value: userId }, ...params] })
            .fetchAll();
        return resources.map((s) => s.postId);
    }
};
exports.SavesRepository = SavesRepository;
exports.SavesRepository = SavesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.COSMOS_DB)),
    __metadata("design:paramtypes", [cosmos_1.Database])
], SavesRepository);
//# sourceMappingURL=saves.repository.js.map