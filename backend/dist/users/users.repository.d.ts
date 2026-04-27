import { Database } from '@azure/cosmos';
import { User } from './user.entity';
export declare class UsersRepository {
    private db;
    constructor(db: Database);
    private get container();
    create(data: Omit<User, 'id' | 'followerCount' | 'followingCount' | 'postCount' | 'createdAt'>): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    update(id: string, data: Partial<User>): Promise<User>;
    incrementCounter(id: string, field: 'followerCount' | 'followingCount' | 'postCount', delta: number): Promise<void>;
    search(q: string, limit?: number): Promise<User[]>;
}
