import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
export declare class SearchService {
    private postsService;
    private usersService;
    constructor(postsService: PostsService, usersService: UsersService);
    search(q: string): Promise<{
        users: import("../users/user.entity").User[];
        posts: import("../posts/post.entity").Post[];
    }>;
}
