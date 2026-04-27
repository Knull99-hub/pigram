import { UsersRepository } from './users.repository';
import { StorageService } from '../storage/storage.service';
import { User, PublicUser } from './user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private repo;
    private storage;
    constructor(repo: UsersRepository, storage: StorageService);
    create(data: Omit<User, 'id' | 'followerCount' | 'followingCount' | 'postCount' | 'createdAt'>): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    search(q: string): Promise<User[]>;
    getProfile(username: string): Promise<PublicUser>;
    updateProfile(id: string, dto: UpdateProfileDto): Promise<PublicUser>;
    updateAvatar(id: string, file: Express.Multer.File): Promise<PublicUser>;
    incrementCounter(id: string, field: 'followerCount' | 'followingCount' | 'postCount', delta: number): Promise<void>;
    sanitize(user: User): PublicUser;
}
