import { Injectable, Inject } from '@nestjs/common';
import { Database } from '@azure/cosmos';
import { COSMOS_DB } from '../database/database.module';
import { v4 as uuidv4 } from 'uuid';

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

@Injectable()
export class FollowsRepository {
  constructor(@Inject(COSMOS_DB) private db: Database) {}

  private get container() { return this.db.container('follows'); }

  async create(followerId: string, followingId: string): Promise<Follow> {
    const doc: Follow = { id: uuidv4(), followerId, followingId, createdAt: new Date().toISOString() };
    const { resource } = await this.container.items.create(doc);
    return resource as Follow;
  }

  async find(followerId: string, followingId: string): Promise<Follow | null> {
    const { resources } = await this.container.items
      .query<Follow>({
        query: 'SELECT * FROM c WHERE c.followerId = @fid AND c.followingId = @tid',
        parameters: [{ name: '@fid', value: followerId }, { name: '@tid', value: followingId }],
      })
      .fetchAll();
    return resources[0] ?? null;
  }

  async delete(followerId: string, followingId: string): Promise<void> {
    const existing = await this.find(followerId, followingId);
    if (existing) await this.container.item(existing.id, followerId).delete();
  }

  async getFollowerIds(userId: string): Promise<string[]> {
    const { resources } = await this.container.items
      .query<Follow>({ query: 'SELECT * FROM c WHERE c.followingId = @uid', parameters: [{ name: '@uid', value: userId }] })
      .fetchAll();
    return resources.map((f) => f.followerId);
  }

  async getFollowingIds(userId: string): Promise<string[]> {
    const { resources } = await this.container.items
      .query<Follow>({ query: 'SELECT * FROM c WHERE c.followerId = @uid', parameters: [{ name: '@uid', value: userId }] })
      .fetchAll();
    return resources.map((f) => f.followingId);
  }
}
