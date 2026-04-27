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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const comments_repository_1 = require("./comments.repository");
const posts_service_1 = require("../posts/posts.service");
const users_service_1 = require("../users/users.service");
const notifications_service_1 = require("../notifications/notifications.service");
let CommentsService = class CommentsService {
    repo;
    postsService;
    usersService;
    notifService;
    constructor(repo, postsService, usersService, notifService) {
        this.repo = repo;
        this.postsService = postsService;
        this.usersService = usersService;
        this.notifService = notifService;
    }
    async getByPost(postId) {
        return this.repo.findByPost(postId);
    }
    async create(postId, userId, text) {
        const [post, author] = await Promise.all([
            this.postsService.findById(postId),
            this.usersService.findById(userId),
        ]);
        const comment = await this.repo.create(postId, userId, author?.username ?? '', author?.avatarUrl ?? '', text);
        await this.postsService.incrementCounter(postId, post.creatorId, 'commentCount', 1);
        if (post.creatorId !== userId) {
            await this.notifService.create({ userId: post.creatorId, actorId: userId, type: 'comment', entityId: comment.id, entityType: 'comment' });
        }
        return comment;
    }
    async delete(commentId, userId) {
        const comment = await this.repo.findByIdAny(commentId);
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.authorId !== userId)
            throw new common_1.ForbiddenException('Not your comment');
        const post = await this.postsService.findById(comment.postId);
        await this.repo.delete(commentId, comment.postId);
        await this.postsService.incrementCounter(comment.postId, post.creatorId, 'commentCount', -1);
        return { deleted: true };
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [comments_repository_1.CommentsRepository,
        posts_service_1.PostsService,
        users_service_1.UsersService,
        notifications_service_1.NotificationsService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map