import { SavesService } from './saves.service';
export declare class SavesController {
    private savesService;
    constructor(savesService: SavesService);
    save(user: any, postId: string): Promise<{
        saved: boolean;
    }>;
    unsave(user: any, postId: string): Promise<{
        saved: boolean;
    }>;
    getSaved(user: any): Promise<(import("../posts/post.entity").Post | null)[]>;
}
