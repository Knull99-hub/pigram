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
exports.FollowsService = void 0;
const common_1 = require("@nestjs/common");
const follows_repository_1 = require("./follows.repository");
const users_service_1 = require("../users/users.service");
const notifications_service_1 = require("../notifications/notifications.service");
let FollowsService = class FollowsService {
    repo;
    usersService;
    notifService;
    constructor(repo, usersService, notifService) {
        this.repo = repo;
        this.usersService = usersService;
        this.notifService = notifService;
    }
    async follow(followerId, followingId) {
        if (followerId === followingId)
            throw new common_1.BadRequestException('Cannot follow yourself');
        const existing = await this.repo.find(followerId, followingId);
        if (existing)
            return { message: 'Already following' };
        await this.repo.create(followerId, followingId);
        await Promise.all([
            this.usersService.incrementCounter(followerId, 'followingCount', 1),
            this.usersService.incrementCounter(followingId, 'followerCount', 1),
            this.notifService.create({ userId: followingId, actorId: followerId, type: 'follow', entityId: followerId, entityType: 'user' }),
        ]);
        return { following: true };
    }
    async unfollow(followerId, followingId) {
        const existing = await this.repo.find(followerId, followingId);
        if (!existing)
            return { message: 'Not following' };
        await this.repo.delete(followerId, followingId);
        await Promise.all([
            this.usersService.incrementCounter(followerId, 'followingCount', -1),
            this.usersService.incrementCounter(followingId, 'followerCount', -1),
        ]);
        return { following: false };
    }
    async isFollowing(followerId, followingId) {
        const r = await this.repo.find(followerId, followingId);
        return !!r;
    }
    async getFollowingIds(userId) {
        return this.repo.getFollowingIds(userId);
    }
    async getFollowers(userId) {
        const ids = await this.repo.getFollowerIds(userId);
        const users = await Promise.all(ids.map((id) => this.usersService.findById(id)));
        return users.filter(Boolean).map((u) => this.usersService.sanitize(u));
    }
    async getFollowing(userId) {
        const ids = await this.repo.getFollowingIds(userId);
        const users = await Promise.all(ids.map((id) => this.usersService.findById(id)));
        return users.filter(Boolean).map((u) => this.usersService.sanitize(u));
    }
};
exports.FollowsService = FollowsService;
exports.FollowsService = FollowsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => notifications_service_1.NotificationsService))),
    __metadata("design:paramtypes", [follows_repository_1.FollowsRepository,
        users_service_1.UsersService,
        notifications_service_1.NotificationsService])
], FollowsService);
//# sourceMappingURL=follows.service.js.map