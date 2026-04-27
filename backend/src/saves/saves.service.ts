import { Injectable } from '@nestjs/common';
import { SavesRepository } from './saves.repository';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class SavesService {
  constructor(private repo: SavesRepository, private postsService: PostsService) {}

  async save(postId: string, userId: string) {
    const existing = await this.repo.find(postId, userId);
    if (existing) return { saved: true };
    const post = await this.postsService.findById(postId);
    await this.repo.create(postId, userId);
    await this.postsService.incrementCounter(postId, post.creatorId, 'saveCount', 1);
    return { saved: true };
  }

  async unsave(postId: string, userId: string) {
    const existing = await this.repo.find(postId, userId);
    if (!existing) return { saved: false };
    const post = await this.postsService.findById(postId);
    await this.repo.delete(postId, userId);
    await this.postsService.incrementCounter(postId, post.creatorId, 'saveCount', -1);
    return { saved: false };
  }

  async getSavedPosts(userId: string) {
    const postIds = await this.repo.getSavedPostIds(userId);
    const posts = await Promise.all(postIds.map((id) => this.postsService.findById(id).catch(() => null)));
    return posts.filter(Boolean);
  }

  async getSavedPostIds(userId: string, postIds: string[]): Promise<string[]> {
    return this.repo.getSavedPostIdsForPosts(userId, postIds);
  }
}
