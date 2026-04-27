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
exports.LikesService = void 0;
const common_1 = require("@nestjs/common");
const likes_repository_1 = require("./likes.repository");
const posts_service_1 = require("../posts/posts.service");
const notifications_service_1 = require("../notifications/notifications.service");
let LikesService = class LikesService {
    repo;
    postsService;
    notifService;
    constructor(repo, postsService, notifService) {
        this.repo = repo;
        this.postsService = postsService;
        this.notifService = notifService;
    }
    async like(postId, userId) {
        const existing = await this.repo.find(postId, userId);
        if (existing)
            return { liked: true };
        const post = await this.postsService.findById(postId);
        await this.repo.create(postId, userId);
        await this.postsService.incrementCounter(postId, post.creatorId, 'likeCount', 1);
        if (post.creatorId !== userId) {
            await this.notifService.create({ userId: post.creatorId, actorId: userId, type: 'like', entityId: postId, entityType: 'post' });
        }
        return { liked: true };
    }
    async unlike(postId, userId) {
        const existing = await this.repo.find(postId, userId);
        if (!existing)
            return { liked: false };
        const post = await this.postsService.findById(postId);
        await this.repo.delete(postId, userId);
        await this.postsService.incrementCounter(postId, post.creatorId, 'likeCount', -1);
        return { liked: false };
    }
    async getLikedPostIds(userId, postIds) {
        return this.repo.getLikedPostIds(userId, postIds);
    }
};
exports.LikesService = LikesService;
exports.LikesService = LikesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [likes_repository_1.LikesRepository,
        posts_service_1.PostsService,
        notifications_service_1.NotificationsService])
], LikesService);
//# sourceMappingURL=likes.service.js.map