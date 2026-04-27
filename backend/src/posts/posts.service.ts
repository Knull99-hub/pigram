import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { StorageService } from '../storage/storage.service';
import { UsersService } from '../users/users.service';
import { CacheService } from '../cache/cache.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor(
    private repo: PostsRepository,
    private storage: StorageService,
    private usersService: UsersService,
    private cache: CacheService,
  ) {}

  async create(creatorId: string, dto: CreatePostDto, file: Express.Multer.File): Promise<Post> {
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

  async findById(id: string): Promise<Post> {
    const cached = await this.cache.get<Post>(`post:${id}`);
    if (cached) return cached;
    const post = await this.repo.findByIdAny(id);
    if (!post) throw new NotFoundException('Post not found');
    await this.cache.set(`post:${id}`, post, 120);
    return post;
  }

  async findByUser(userId: string, limit = 20, offset = 0): Promise<Post[]> {
    return this.repo.findByUser(userId, limit, offset);
  }

  async getDiscover(limit = 20, offset = 0): Promise<Post[]> {
    const key = `discover:${offset}:${limit}`;
    const cached = await this.cache.get<Post[]>(key);
    if (cached) return cached;
    const posts = await this.repo.findRecent(limit, offset);
    await this.cache.set(key, posts, 60);
    return posts;
  }

  async update(id: string, userId: string, dto: UpdatePostDto): Promise<Post> {
    const post = await this.repo.findByIdAny(id);
    if (!post) throw new NotFoundException('Post not found');
    if (post.creatorId !== userId) throw new ForbiddenException('Not your post');
    const updated = await this.repo.update(id, post.creatorId, dto);
    await this.cache.del(`post:${id}`);
    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const post = await this.repo.findByIdAny(id);
    if (!post) throw new NotFoundException('Post not found');
    if (post.creatorId !== userId) throw new ForbiddenException('Not your post');
    await this.storage.delete(post.imageUrl);
    await this.repo.delete(id, post.creatorId);
    await this.usersService.incrementCounter(userId, 'postCount', -1);
    await this.cache.del(`post:${id}`);
  }

  async incrementCounter(id: string, creatorId: string, field: 'likeCount' | 'commentCount' | 'saveCount', delta: number) {
    await this.repo.incrementCounter(id, creatorId, field, delta);
    await this.cache.del(`post:${id}`);
  }

  search(q: string) { return this.repo.search(q); }
  findByCreatorIds(ids: string[], limit: number, offset: number) { return this.repo.findByCreatorIds(ids, limit, offset); }
}
