import { Injectable, Inject } from '@nestjs/common';
import { Database } from '@azure/cosmos';
import { COSMOS_DB } from '../database/database.module';
import { v4 as uuidv4 } from 'uuid';

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

@Injectable()
export class NotificationsRepository {
  constructor(@Inject(COSMOS_DB) private db: Database) {}

  private get container() { return this.db.container('notifications'); }

  async create(data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification> {
    const doc: Notification = { id: uuidv4(), isRead: false, createdAt: new Date().toISOString(), ...data };
    const { resource } = await this.container.items.create(doc);
    return resource as Notification;
  }

  async findByUser(userId: string, limit = 30): Promise<Notification[]> {
    const { resources } = await this.container.items
      .query<Notification>({
        query: 'SELECT * FROM c WHERE c.userId = @uid ORDER BY c.createdAt DESC OFFSET 0 LIMIT @limit',
        parameters: [{ name: '@uid', value: userId }, { name: '@limit', value: limit }],
      })
      .fetchAll();
    return resources;
  }

  async markRead(id: string, userId: string): Promise<void> {
    try {
      const { resource } = await this.container.item(id, userId).read<Notification>();
      if (resource) await this.container.items.upsert({ ...resource, isRead: true });
    } catch { /* not found */ }
  }
}
