import { Injectable, Inject } from '@nestjs/common';
import { Database } from '@azure/cosmos';
import { COSMOS_DB } from '../database/database.module';
import { v4 as uuidv4 } from 'uuid';

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

@Injectable()
export class LikesRepository {
  constructor(@Inject(COSMOS_DB) private db: Database) {}
  private get container() { return this.db.container('likes'); }

  async create(postId: string, userId: string): Promise<Like> {
    const doc: Like = { id: uuidv4(), postId, userId, createdAt: new Date().toISOString() };
    const { resource } = await this.container.items.create(doc);
    return resource as Like;
  }

  async find(postId: string, userId: string): Promise<Like | null> {
    const { resources } = await this.container.items
      .query<Like>({ query: 'SELECT * FROM c WHERE c.postId = @pid AND c.userId = @uid', parameters: [{ name: '@pid', value: postId }, { name: '@uid', value: userId }] })
      .fetchAll();
    return resources[0] ?? null;
  }

  async delete(postId: string, userId: string): Promise<void> {
    const like = await this.find(postId, userId);
    if (like) await this.container.item(like.id, postId).delete();
  }

  async getLikedPostIds(userId: string, postIds: string[]): Promise<string[]> {
    if (postIds.length === 0) return [];
    const params = postIds.map((id, i) => ({ name: `@id${i}`, value: id }));
    const inClause = params.map((p) => p.name).join(',');
    const { resources } = await this.container.items
      .query<Like>({
        query: `SELECT * FROM c WHERE c.userId = @uid AND c.postId IN (${inClause})`,
        parameters: [{ name: '@uid', value: userId }, ...params],
      })
      .fetchAll();
    return resources.map((l) => l.postId);
  }
}
