import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class PostsController {
    private postsService;
    constructor(postsService: PostsService);
    getDiscover(limit?: number, offset?: number): Promise<import("./post.entity").Post[]>;
    getByUser(userId: string, limit?: number, offset?: number): Promise<import("./post.entity").Post[]>;
    getOne(id: string): Promise<import("./post.entity").Post>;
    create(user: any, dto: CreatePostDto, file: Express.Multer.File): Promise<import("./post.entity").Post>;
    update(user: any, id: string, dto: UpdatePostDto): Promise<import("./post.entity").Post>;
    remove(user: any, id: string): Promise<void>;
}
