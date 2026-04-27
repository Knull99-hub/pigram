import { Injectable, Inject } from '@nestjs/common';
import { Database } from '@azure/cosmos';
import { COSMOS_DB } from '../database/database.module';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersRepository {
  constructor(@Inject(COSMOS_DB) private db: Database) {}

  private get container() {
    return this.db.container('users');
  }

  async create(data: Omit<User, 'id' | 'followerCount' | 'followingCount' | 'postCount' | 'createdAt'>): Promise<User> {
    const user: User = {
      ...data,
      id: uuidv4(),
      avatarUrl: data.avatarUrl || '',
      bio: data.bio || '',
      website: data.website || '',
      location: data.location || '',
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      createdAt: new Date().toISOString(),
    };
    const { resource } = await this.container.items.create(user);
    return resource as unknown as User;
  }

  async findById(id: string): Promise<User | null> {
    try {
      const { resource } = await this.container.item(id, id).read<User>();
      return resource ?? null;
    } catch {
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const { resources } = await this.container.items
      .query<User>({ query: 'SELECT * FROM c WHERE c.email = @email', parameters: [{ name: '@email', value: email }] })
      .fetchAll();
    return resources[0] ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const { resources } = await this.container.items
      .query<User>({ query: 'SELECT * FROM c WHERE c.username = @username', parameters: [{ name: '@username', value: username }] })
      .fetchAll();
    return resources[0] ?? null;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const existing = await this.findById(id);
    const updated = { ...existing, ...data } as User;
    const { resource } = await this.container.items.upsert(updated);
    return resource as unknown as User;
  }

  async incrementCounter(id: string, field: 'followerCount' | 'followingCount' | 'postCount', delta: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) return;
    await this.container.items.upsert({ ...user, [field]: Math.max(0, (user[field] || 0) + delta) });
  }

  async search(q: string, limit = 20): Promise<User[]> {
    const { resources } = await this.container.items
      .query<User>({
        query: `SELECT * FROM c WHERE CONTAINS(LOWER(c.username), @q) OR CONTAINS(LOWER(c.displayName), @q) OFFSET 0 LIMIT @limit`,
        parameters: [{ name: '@q', value: q.toLowerCase() }, { name: '@limit', value: limit }],
      })
      .fetchAll();
    return resources;
  }
}
