import { LikesRepository } from './likes.repository';
import { PostsService } from '../posts/posts.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class LikesService {
    private repo;
    private postsService;
    private notifService;
    constructor(repo: LikesRepository, postsService: PostsService, notifService: NotificationsService);
    like(postId: string, userId: string): Promise<{
        liked: boolean;
    }>;
    unlike(postId: string, userId: string): Promise<{
        liked: boolean;
    }>;
    getLikedPostIds(userId: string, postIds: string[]): Promise<string[]>;
}
