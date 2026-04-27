import { Database } from '@azure/cosmos';
import { Post } from './post.entity';
export declare class PostsRepository {
    private db;
    constructor(db: Database);
    private get container();
    create(data: Omit<Post, 'id' | 'likeCount' | 'commentCount' | 'saveCount' | 'createdAt' | 'updatedAt'>): Promise<Post>;
    findById(id: string, creatorId: string): Promise<Post | null>;
    findByIdAny(id: string): Promise<Post | null>;
    findByUser(creatorId: string, limit?: number, offset?: number): Promise<Post[]>;
    findByCreatorIds(creatorIds: string[], limit?: number, offset?: number): Promise<Post[]>;
    findRecent(limit?: number, offset?: number): Promise<Post[]>;
    update(id: string, creatorId: string, data: Partial<Post>): Promise<Post>;
    delete(id: string, creatorId: string): Promise<void>;
    incrementCounter(id: string, creatorId: string, field: 'likeCount' | 'commentCount' | 'saveCount', delta: number): Promise<void>;
    search(q: string, limit?: number): Promise<Post[]>;
}
