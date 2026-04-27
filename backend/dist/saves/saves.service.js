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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavesService = void 0;
const common_1 = require("@nestjs/common");
const saves_repository_1 = require("./saves.repository");
const posts_service_1 = require("../posts/posts.service");
let SavesService = class SavesService {
    repo;
    postsService;
    constructor(repo, postsService) {
        this.repo = repo;
        this.postsService = postsService;
    }
    async save(postId, userId) {
        const existing = await this.repo.find(postId, userId);
        if (existing)
            return { saved: true };
        const post = await this.postsService.findById(postId);
        await this.repo.create(postId, userId);
        await this.postsService.incrementCounter(postId, post.creatorId, 'saveCount', 1);
        return { saved: true };
    }
    async unsave(postId, userId) {
        const existing = await this.repo.find(postId, userId);
        if (!existing)
            return { saved: false };
        const post = await this.postsService.findById(postId);
        await this.repo.delete(postId, userId);
        await this.postsService.incrementCounter(postId, post.creatorId, 'saveCount', -1);
        return { saved: false };
    }
    async getSavedPosts(userId) {
        const postIds = await this.repo.getSavedPostIds(userId);
        const posts = await Promise.all(postIds.map((id) => this.postsService.findById(id).catch(() => null)));
        return posts.filter(Boolean);
    }
    async getSavedPostIds(userId, postIds) {
        return this.repo.getSavedPostIdsForPosts(userId, postIds);
    }
};
exports.SavesService = SavesService;
exports.SavesService = SavesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [saves_repository_1.SavesRepository, posts_service_1.PostsService])
], SavesService);
//# sourceMappingURL=saves.service.js.map