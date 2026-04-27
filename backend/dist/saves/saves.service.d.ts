import { SavesRepository } from './saves.repository';
import { PostsService } from '../posts/posts.service';
export declare class SavesService {
    private repo;
    private postsService;
    constructor(repo: SavesRepository, postsService: PostsService);
    save(postId: string, userId: string): Promise<{
        saved: boolean;
    }>;
    unsave(postId: string, userId: string): Promise<{
        saved: boolean;
    }>;
    getSavedPosts(userId: string): Promise<(import("../posts/post.entity").Post | null)[]>;
    getSavedPostIds(userId: string, postIds: string[]): Promise<string[]>;
}
