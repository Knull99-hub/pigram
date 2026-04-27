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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const posts_repository_1 = require("./posts.repository");
const storage_service_1 = require("../storage/storage.service");
const users_service_1 = require("../users/users.service");
const cache_service_1 = require("../cache/cache.service");
let PostsService = class PostsService {
    repo;
    storage;
    usersService;
    cache;
    constructor(repo, storage, usersService, cache) {
        this.repo = repo;
        this.storage = storage;
        this.usersService = usersService;
        this.cache = cache;
    }
    async create(creatorId, dto, file) {
        const [imageUrl, creator] = await Promise.all([
            this.storage.upload(file.buffer, file.originalname, file.mimetype),
            this.usersService.findById(creatorId),
        ]);
        const post = await this.repo.create({
            creatorId,
            creatorUsername: creator?.username ?? '',
            creatorAvatarUrl: creator?.avatarUrl ?? '',
            imageUrl,
            blobName: imageUrl,
            caption: dto.caption,
            location: dto.location ?? '',
            peoplePresent: dto.peoplePresent ?? [],
            tags: dto.tags ?? [],
        });
        await this.usersService.incrementCounter(creatorId, 'postCount', 1);
        await this.cache.delByPattern(`feed:${creatorId}:*`);
        return post;
    }
    async findById(id) {
        const cached = await this.cache.get(`post:${id}`);
        if (cached)
            return cached;
        const post = await this.repo.findByIdAny(id);
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        await this.cache.set(`post:${id}`, post, 120);
        return post;
    }
    async findByUser(userId, limit = 20, offset = 0) {
        return this.repo.findByUser(userId, limit, offset);
    }
    async getDiscover(limit = 20, offset = 0) {
        const key = `discover:${offset}:${limit}`;
        const cached = await this.cache.get(key);
        if (cached)
            return cached;
        const posts = await this.repo.findRecent(limit, offset);
        await this.cache.set(key, posts, 60);
        return posts;
    }
    async update(id, userId, dto) {
        const post = await this.repo.findByIdAny(id);
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        if (post.creatorId !== userId)
            throw new common_1.ForbiddenException('Not your post');
        const updated = await this.repo.update(id, post.creatorId, dto);
        await this.cache.del(`post:${id}`);
        return updated;
    }
    async delete(id, userId) {
        const post = await this.repo.findByIdAny(id);
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        if (post.creatorId !== userId)
            throw new common_1.ForbiddenException('Not your post');
        await this.storage.delete(post.imageUrl);
        await this.repo.delete(id, post.creatorId);
        await this.usersService.incrementCounter(userId, 'postCount', -1);
        await this.cache.del(`post:${id}`);
    }
    async incrementCounter(id, creatorId, field, delta) {
        await this.repo.incrementCounter(id, creatorId, field, delta);
        await this.cache.del(`post:${id}`);
    }
    search(q) { return this.repo.search(q); }
    findByCreatorIds(ids, limit, offset) { return this.repo.findByCreatorIds(ids, limit, offset); }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [posts_repository_1.PostsRepository,
        storage_service_1.StorageService,
        users_service_1.UsersService,
        cache_service_1.CacheService])
], PostsService);
//# sourceMappingURL=posts.service.js.map