import { CommentsRepository } from './comments.repository';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class CommentsService {
    private repo;
    private postsService;
    private usersService;
    private notifService;
    constructor(repo: CommentsRepository, postsService: PostsService, usersService: UsersService, notifService: NotificationsService);
    getByPost(postId: string): Promise<import("./comments.repository").Comment[]>;
    create(postId: string, userId: string, text: string): Promise<import("./comments.repository").Comment>;
    delete(commentId: string, userId: string): Promise<{
        deleted: boolean;
    }>;
}
