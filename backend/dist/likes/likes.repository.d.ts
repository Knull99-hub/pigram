import { Database } from '@azure/cosmos';
export interface Like {
    id: string;
    postId: string;
    userId: string;
    createdAt: string;
}
export declare class LikesRepository {
    private db;
    constructor(db: Database);
    private get container();
    create(postId: string, userId: string): Promise<Like>;
    find(postId: string, userId: string): Promise<Like | null>;
    delete(postId: string, userId: string): Promise<void>;
    getLikedPostIds(userId: string, postIds: string[]): Promise<string[]>;
}
