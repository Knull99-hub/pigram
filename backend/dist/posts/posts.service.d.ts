import { PostsRepository } from './posts.repository';
import { StorageService } from '../storage/storage.service';
import { UsersService } from '../users/users.service';
import { CacheService } from '../cache/cache.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './post.entity';
export declare class PostsService {
    private repo;
    private storage;
    private usersService;
    private cache;
    constructor(repo: PostsRepository, storage: StorageService, usersService: UsersService, cache: CacheService);
    create(creatorId: string, dto: CreatePostDto, file: Express.Multer.File): Promise<Post>;
    findById(id: string): Promise<Post>;
    findByUser(userId: string, limit?: number, offset?: number): Promise<Post[]>;
    getDiscover(limit?: number, offset?: number): Promise<Post[]>;
    update(id: string, userId: string, dto: UpdatePostDto): Promise<Post>;
    delete(id: string, userId: string): Promise<void>;
    incrementCounter(id: string, creatorId: string, field: 'likeCount' | 'commentCount' | 'saveCount', delta: number): Promise<void>;
    search(q: string): Promise<Post[]>;
    findByCreatorIds(ids: string[], limit: number, offset: number): Promise<Post[]>;
}
