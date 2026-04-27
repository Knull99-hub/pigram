import { FollowsRepository } from './follows.repository';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class FollowsService {
    private repo;
    private usersService;
    private notifService;
    constructor(repo: FollowsRepository, usersService: UsersService, notifService: NotificationsService);
    follow(followerId: string, followingId: string): Promise<{
        message: string;
        following?: undefined;
    } | {
        following: boolean;
        message?: undefined;
    }>;
    unfollow(followerId: string, followingId: string): Promise<{
        message: string;
        following?: undefined;
    } | {
        following: boolean;
        message?: undefined;
    }>;
    isFollowing(followerId: string, followingId: string): Promise<boolean>;
    getFollowingIds(userId: string): Promise<string[]>;
    getFollowers(userId: string): Promise<import("../users/user.entity").PublicUser[]>;
    getFollowing(userId: string): Promise<import("../users/user.entity").PublicUser[]>;
}
