import { PostsService } from '../posts/posts.service';
import { FollowsService } from '../follows/follows.service';
import { LikesService } from '../likes/likes.service';
import { SavesService } from '../saves/saves.service';
import { CacheService } from '../cache/cache.service';
export declare class FeedService {
    private postsService;
    private followsService;
    private likesService;
    private savesService;
    private cache;
    constructor(postsService: PostsService, followsService: FollowsService, likesService: LikesService, savesService: SavesService, cache: CacheService);
    getFeed(userId: string, limit?: number, offset?: number): Promise<any[]>;
}
