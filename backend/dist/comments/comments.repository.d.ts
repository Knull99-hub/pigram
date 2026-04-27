import { Database } from '@azure/cosmos';
export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    authorUsername: string;
    authorAvatarUrl: string;
    text: string;
    createdAt: string;
}
export declare class CommentsRepository {
    private db;
    constructor(db: Database);
    private get container();
    create(postId: string, authorId: string, authorUsername: string, authorAvatarUrl: string, text: string): Promise<Comment>;
    findByPost(postId: string): Promise<Comment[]>;
    findByIdAny(id: string): Promise<Comment | null>;
    delete(id: string, postId: string): Promise<void>;
}
