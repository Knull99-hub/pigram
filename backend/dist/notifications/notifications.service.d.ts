import { NotificationsRepository, Notification } from './notifications.repository';
export declare class NotificationsService {
    private repo;
    constructor(repo: NotificationsRepository);
    create(data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification>;
    getForUser(userId: string): Promise<Notification[]>;
    markRead(id: string, userId: string): Promise<void>;
}
