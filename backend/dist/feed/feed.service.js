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
exports.FeedService = void 0;
const common_1 = require("@nestjs/common");
const posts_service_1 = require("../posts/posts.service");
const follows_service_1 = require("../follows/follows.service");
const likes_service_1 = require("../likes/likes.service");
const saves_service_1 = require("../saves/saves.service");
const cache_service_1 = require("../cache/cache.service");
let FeedService = class FeedService {
    postsService;
    followsService;
    likesService;
    savesService;
    cache;
    constructor(postsService, followsService, likesService, savesService, cache) {
        this.postsService = postsService;
        this.followsService = followsService;
        this.likesService = likesService;
        this.savesService = savesService;
        this.cache = cache;
    }
    async getFeed(userId, limit = 20, offset = 0) {
        const cacheKey = `feed:${userId}:${offset}:${limit}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const followingIds = await this.followsService.getFollowingIds(userId);
        let posts = followingIds.length > 0
            ? await this.postsService.findByCreatorIds(followingIds, limit, offset)
            : await this.postsService.getDiscover(limit, offset);
        const postIds = posts.map((p) => p.id);
        const [likedIds, savedIds] = await Promise.all([
            this.likesService.getLikedPostIds(userId, postIds),
            this.savesService.getSavedPostIds(userId, postIds),
        ]);
        const enriched = posts.map((p) => ({
            ...p,
            liked: likedIds.includes(p.id),
            saved: savedIds.includes(p.id),
        }));
        await this.cache.set(cacheKey, enriched, 60);
        return enriched;
    }
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [posts_service_1.PostsService,
        follows_service_1.FollowsService,
        likes_service_1.LikesService,
        saves_service_1.SavesService,
        cache_service_1.CacheService])
], FeedService);
//# sourceMappingURL=feed.service.js.map