import { SearchService } from './search.service';
export declare class SearchController {
    private searchService;
    constructor(searchService: SearchService);
    search(q: string): Promise<{
        users: import("../users/user.entity").User[];
        posts: import("../posts/post.entity").Post[];
    }> | {
        users: never[];
        posts: never[];
    };
}
