import { Injectable } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { FollowsService } from '../follows/follows.service';
import { LikesService } from '../likes/likes.service';
import { SavesService } from '../saves/saves.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class FeedService {
  constructor(
    private postsService: PostsService,
    private followsService: FollowsService,
    private likesService: LikesService,
    private savesService: SavesService,
    private cache: CacheService,
  ) {}

  async getFeed(userId: string, limit = 20, offset = 0) {
    const cacheKey = `feed:${userId}:${offset}:${limit}`;
    const cached = await this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

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
}
