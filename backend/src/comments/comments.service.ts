import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    private repo: CommentsRepository,
    private postsService: PostsService,
    private usersService: UsersService,
    private notifService: NotificationsService,
  ) {}

  async getByPost(postId: string) {
    return this.repo.findByPost(postId);
  }

  async create(postId: string, userId: string, text: string) {
    const [post, author] = await Promise.all([
      this.postsService.findById(postId),
      this.usersService.findById(userId),
    ]);
    const comment = await this.repo.create(
      postId,
      userId,
      author?.username ?? '',
      author?.avatarUrl ?? '',
      text,
    );
    await this.postsService.incrementCounter(postId, post.creatorId, 'commentCount', 1);
    if (post.creatorId !== userId) {
      await this.notifService.create({ userId: post.creatorId, actorId: userId, type: 'comment', entityId: comment.id, entityType: 'comment' });
    }
    return comment;
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.repo.findByIdAny(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Not your comment');
    const post = await this.postsService.findById(comment.postId);
    await this.repo.delete(commentId, comment.postId);
    await this.postsService.incrementCounter(comment.postId, post.creatorId, 'commentCount', -1);
    return { deleted: true };
  }
}
