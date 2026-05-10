import { Injectable, Inject } from '@nestjs/common';
import { Database } from '@azure/cosmos';
import { COSMOS_DB } from '../database/database.module';
import { v4 as uuidv4 } from 'uuid';

export interface Rating {
  id: string;
  postId: string;
  userId: string;
  value: number;
  createdAt: string;
}

@Injectable()
export class RatingsRepository {
  constructor(@Inject(COSMOS_DB) private db: Database) {}
  private get container() { return this.db.container('ratings'); }

  async find(postId: string, userId: string): Promise<Rating | null> {
    const { resources } = await this.container.items
      .query<Rating>({ query: 'SELECT * FROM c WHERE c.postId = @pid AND c.userId = @uid', parameters: [{ name: '@pid', value: postId }, { name: '@uid', value: userId }] })
      .fetchAll();
    return resources[0] ?? null;
  }

  async upsert(postId: string, userId: string, value: number): Promise<{ rating: Rating; isNew: boolean; oldValue: number }> {
    const existing = await this.find(postId, userId);
    if (existing) {
      const oldValue = existing.value;
      const updated = { ...existing, value };
      const { resource } = await this.container.items.upsert(updated);
      return { rating: resource as Rating, isNew: false, oldValue };
    }
    const doc: Rating = { id: uuidv4(), postId, userId, value, createdAt: new Date().toISOString() };
    const { resource } = await this.container.items.create(doc);
    return { rating: resource as Rating, isNew: true, oldValue: 0 };
  }
}
