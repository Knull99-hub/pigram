import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { FollowsRepository } from './follows.repository';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FollowsService {
  constructor(
    private repo: FollowsRepository,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    @Inject(forwardRef(() => NotificationsService)) private notifService: NotificationsService,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException('Cannot follow yourself');
    const existing = await this.repo.find(followerId, followingId);
    if (existing) return { message: 'Already following' };

    await this.repo.create(followerId, followingId);
    await Promise.all([
      this.usersService.incrementCounter(followerId, 'followingCount', 1),
      this.usersService.incrementCounter(followingId, 'followerCount', 1),
      this.notifService.create({ userId: followingId, actorId: followerId, type: 'follow', entityId: followerId, entityType: 'user' }),
    ]);
    return { following: true };
  }

  async unfollow(followerId: string, followingId: string) {
    const existing = await this.repo.find(followerId, followingId);
    if (!existing) return { message: 'Not following' };

    await this.repo.delete(followerId, followingId);
    await Promise.all([
      this.usersService.incrementCounter(followerId, 'followingCount', -1),
      this.usersService.incrementCounter(followingId, 'followerCount', -1),
    ]);
    return { following: false };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const r = await this.repo.find(followerId, followingId);
    return !!r;
  }

  async getFollowingIds(userId: string): Promise<string[]> {
    return this.repo.getFollowingIds(userId);
  }

  async getFollowers(userId: string) {
    const ids = await this.repo.getFollowerIds(userId);
    const users = await Promise.all(ids.map((id) => this.usersService.findById(id)));
    return users.filter(Boolean).map((u) => this.usersService.sanitize(u!));
  }

  async getFollowing(userId: string) {
    const ids = await this.repo.getFollowingIds(userId);
    const users = await Promise.all(ids.map((id) => this.usersService.findById(id)));
    return users.filter(Boolean).map((u) => this.usersService.sanitize(u!));
  }
}
