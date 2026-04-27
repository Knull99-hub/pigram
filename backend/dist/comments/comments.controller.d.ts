import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsController {
    private commentsService;
    constructor(commentsService: CommentsService);
    getComments(postId: string): Promise<import("./comments.repository").Comment[]>;
    createComment(user: any, postId: string, dto: CreateCommentDto): Promise<import("./comments.repository").Comment>;
    deleteComment(user: any, commentId: string): Promise<{
        deleted: boolean;
    }>;
}
