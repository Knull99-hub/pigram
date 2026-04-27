import { Injectable } from '@nestjs/common';
import { LikesRepository } from './likes.repository';
import { PostsService } from '../posts/posts.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(
    private repo: LikesRepository,
    private postsService: PostsService,
    private notifService: NotificationsService,
  ) {}

  async like(postId: string, userId: string) {
    const existing = await this.repo.find(postId, userId);
    if (existing) return { liked: true };
    const post = await this.postsService.findById(postId);
    await this.repo.create(postId, userId);
    await this.postsService.incrementCounter(postId, post.creatorId, 'likeCount', 1);
    if (post.creatorId !== userId) {
      await this.notifService.create({ userId: post.creatorId, actorId: userId, type: 'like', entityId: postId, entityType: 'post' });
    }
    return { liked: true };
  }

  async unlike(postId: string, userId: string) {
    const existing = await this.repo.find(postId, userId);
    if (!existing) return { liked: false };
    const post = await this.postsService.findById(postId);
    await this.repo.delete(postId, userId);
    await this.postsService.incrementCounter(postId, post.creatorId, 'likeCount', -1);
    return { liked: false };
  }

  async getLikedPostIds(userId: string, postIds: string[]): Promise<string[]> {
    return this.repo.getLikedPostIds(userId, postIds);
  }
}
