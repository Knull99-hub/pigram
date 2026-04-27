import { FeedService } from './feed.service';
export declare class FeedController {
    private feedService;
    constructor(feedService: FeedService);
    getFeed(user: any, limit?: number, offset?: number): Promise<any[]>;
}
