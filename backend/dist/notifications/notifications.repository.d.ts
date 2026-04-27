import { Database } from '@azure/cosmos';
export interface Notification {
    id: string;
    userId: string;
    actorId: string;
    type: 'follow' | 'like' | 'comment';
    entityId: string;
    entityType: 'user' | 'post' | 'comment';
    isRead: boolean;
    createdAt: string;
}
export declare class NotificationsRepository {
    private db;
    constructor(db: Database);
    private get container();
    create(data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification>;
    findByUser(userId: string, limit?: number): Promise<Notification[]>;
    markRead(id: string, userId: string): Promise<void>;
}
