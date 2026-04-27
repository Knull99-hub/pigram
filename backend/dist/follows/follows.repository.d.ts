import { Database } from '@azure/cosmos';
export interface Follow {
    id: string;
    followerId: string;
    followingId: string;
    createdAt: string;
}
export declare class FollowsRepository {
    private db;
    constructor(db: Database);
    private get container();
    create(followerId: string, followingId: string): Promise<Follow>;
    find(followerId: string, followingId: string): Promise<Follow | null>;
    delete(followerId: string, followingId: string): Promise<void>;
    getFollowerIds(userId: string): Promise<string[]>;
    getFollowingIds(userId: string): Promise<string[]>;
}
