import { LikesService } from './likes.service';
export declare class LikesController {
    private likesService;
    constructor(likesService: LikesService);
    like(user: any, postId: string): Promise<{
        liked: boolean;
    }>;
    unlike(user: any, postId: string): Promise<{
        liked: boolean;
    }>;
}
