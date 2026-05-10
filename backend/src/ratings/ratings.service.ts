import { Injectable } from '@nestjs/common';
import { RatingsRepository } from './ratings.repository';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class RatingsService {
  constructor(private repo: RatingsRepository, private postsService: PostsService) {}

  async rate(postId: string, userId: string, value: number) {
    const post = await this.postsService.findById(postId);
    const { rating, isNew, oldValue } = await this.repo.upsert(postId, userId, value);
    await this.postsService.updateRating(postId, post.creatorId, oldValue, value, isNew);
    return { rating: rating.value };
  }

  async getUserRating(postId: string, userId: string) {
    const rating = await this.repo.find(postId, userId);
    return { value: rating?.value ?? 0 };
  }
}
