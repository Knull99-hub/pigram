import { Injectable, Inject } from '@nestjs/common';
import { Database } from '@azure/cosmos';
import { COSMOS_DB } from '../database/database.module';
import { Post } from './post.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PostsRepository {
  constructor(@Inject(COSMOS_DB) private db: Database) {}

  private get container() { return this.db.container('posts'); }

  async create(data: Omit<Post, 'id' | 'likeCount' | 'commentCount' | 'saveCount' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const now = new Date().toISOString();
    const post: Post = { id: uuidv4(), likeCount: 0, commentCount: 0, saveCount: 0, createdAt: now, updatedAt: now, ...data };
    const { resource } = await this.container.items.create(post);
    return resource as Post;
  }

  async findById(id: string, creatorId: string): Promise<Post | null> {
    try {
      const { resource } = await this.container.item(id, creatorId).read<Post>();
      return resource ?? null;
    } catch { return null; }
  }

  async findByIdAny(id: string): Promise<Post | null> {
    const { resources } = await this.container.items
      .query<Post>({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: id }] })
      .fetchAll();
    return resources[0] ?? null;
  }

  async findByUser(creatorId: string, limit = 20, offset = 0): Promise<Post[]> {
    const { resources } = await this.container.items
      .query<Post>({
        query: 'SELECT * FROM c WHERE c.creatorId = @cid ORDER BY c.createdAt DESC OFFSET @off LIMIT @lim',
        parameters: [{ name: '@cid', value: creatorId }, { name: '@off', value: offset }, { name: '@lim', value: limit }],
      })
      .fetchAll();
    return resources;
  }

  async findByCreatorIds(creatorIds: string[], limit = 20, offset = 0): Promise<Post[]> {
    if (creatorIds.length === 0) return [];
    const params = creatorIds.map((id, i) => ({ name: `@id${i}`, value: id }));
    const inClause = params.map((p) => p.name).join(',');
    const { resources } = await this.container.items
      .query<Post>({
        query: `SELECT * FROM c WHERE c.creatorId IN (${inClause}) ORDER BY c.createdAt DESC OFFSET @off LIMIT @lim`,
        parameters: [...params, { name: '@off', value: offset }, { name: '@lim', value: limit }],
      })
      .fetchAll();
    return resources;
  }

  async findRecent(limit = 20, offset = 0): Promise<Post[]> {
    const { resources } = await this.container.items
      .query<Post>({
        query: 'SELECT * FROM c ORDER BY c.createdAt DESC OFFSET @off LIMIT @lim',
        parameters: [{ name: '@off', value: offset }, { name: '@lim', value: limit }],
      })
      .fetchAll();
    return resources;
  }

  async update(id: string, creatorId: string, data: Partial<Post>): Promise<Post> {
    const existing = await this.findById(id, creatorId);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() } as Post;
    const { resource } = await this.container.items.upsert(updated);
    return resource as unknown as Post;
  }

  async delete(id: string, creatorId: string): Promise<void> {
    await this.container.item(id, creatorId).delete();
  }

  async incrementCounter(id: string, creatorId: string, field: 'likeCount' | 'commentCount' | 'saveCount', delta: number): Promise<void> {
    const post = await this.findById(id, creatorId);
    if (!post) return;
    await this.container.items.upsert({ ...post, [field]: Math.max(0, (post[field] || 0) + delta) });
  }

  async search(q: string, limit = 20): Promise<Post[]> {
    const { resources } = await this.container.items
      .query<Post>({
        query: `SELECT * FROM c WHERE CONTAINS(LOWER(c.caption), @q) OR CONTAINS(LOWER(c.location), @q) OFFSET 0 LIMIT @limit`,
        parameters: [{ name: '@q', value: q.toLowerCase() }, { name: '@limit', value: limit }],
      })
      .fetchAll();
    return resources;
  }
}
