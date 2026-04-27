import { Injectable, Inject } from '@nestjs/common';
import { Database } from '@azure/cosmos';
import { COSMOS_DB } from '../database/database.module';
import { v4 as uuidv4 } from 'uuid';

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string;
  text: string;
  createdAt: string;
}

@Injectable()
export class CommentsRepository {
  constructor(@Inject(COSMOS_DB) private db: Database) {}
  private get container() { return this.db.container('comments'); }

  async create(postId: string, authorId: string, authorUsername: string, authorAvatarUrl: string, text: string): Promise<Comment> {
    const doc: Comment = { id: uuidv4(), postId, authorId, authorUsername, authorAvatarUrl, text, createdAt: new Date().toISOString() };
    const { resource } = await this.container.items.create(doc);
    return resource as Comment;
  }

  async findByPost(postId: string): Promise<Comment[]> {
    const { resources } = await this.container.items
      .query<Comment>({ query: 'SELECT * FROM c WHERE c.postId = @pid ORDER BY c.createdAt ASC', parameters: [{ name: '@pid', value: postId }] })
      .fetchAll();
    return resources;
  }

  async findByIdAny(id: string): Promise<Comment | null> {
    const { resources } = await this.container.items
      .query<Comment>({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: id }] })
      .fetchAll();
    return resources[0] ?? null;
  }

  async delete(id: string, postId: string): Promise<void> {
    await this.container.item(id, postId).delete();
  }
}
