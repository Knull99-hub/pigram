import { UsersService } from './users.service';
import { FollowsService } from '../follows/follows.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private usersService;
    private followsService;
    constructor(usersService: UsersService, followsService: FollowsService);
    getProfile(username: string): Promise<import("./user.entity").PublicUser>;
    updateProfile(user: any, dto: UpdateProfileDto): Promise<import("./user.entity").PublicUser>;
    uploadAvatar(user: any, file: Express.Multer.File): Promise<import("./user.entity").PublicUser>;
    getFollowers(id: string): Promise<import("./user.entity").PublicUser[]>;
    getFollowing(id: string): Promise<import("./user.entity").PublicUser[]>;
    followStatus(user: any, targetId: string): Promise<{
        following: boolean;
    }>;
    follow(user: any, targetId: string): Promise<{
        message: string;
        following?: undefined;
    } | {
        following: boolean;
        message?: undefined;
    }>;
    unfollow(user: any, targetId: string): Promise<{
        message: string;
        following?: undefined;
    } | {
        following: boolean;
        message?: undefined;
    }>;
}
