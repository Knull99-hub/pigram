import { Database } from '@azure/cosmos';
export interface Save {
    id: string;
    postId: string;
    userId: string;
    createdAt: string;
}
export declare class SavesRepository {
    private db;
    constructor(db: Database);
    private get container();
    create(postId: string, userId: string): Promise<Save>;
    find(postId: string, userId: string): Promise<Save | null>;
    delete(postId: string, userId: string): Promise<void>;
    getSavedPostIds(userId: string): Promise<string[]>;
    getSavedPostIdsForPosts(userId: string, postIds: string[]): Promise<string[]>;
}
