import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { StorageService } from '../storage/storage.service';
import { User, PublicUser } from './user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private repo: UsersRepository, private storage: StorageService) {}

  create(data: Omit<User, 'id' | 'followerCount' | 'followingCount' | 'postCount' | 'createdAt'>) {
    return this.repo.create(data);
  }

  findById(id: string) { return this.repo.findById(id); }
  findByEmail(email: string) { return this.repo.findByEmail(email); }
  findByUsername(username: string) { return this.repo.findByUsername(username); }
  search(q: string) { return this.repo.search(q); }

  async getProfile(username: string): Promise<PublicUser> {
    const user = await this.repo.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const updated = await this.repo.update(id, dto);
    return this.sanitize(updated);
  }

  async updateAvatar(id: string, file: Express.Multer.File): Promise<PublicUser> {
    const url = await this.storage.upload(file.buffer, file.originalname, file.mimetype);
    const updated = await this.repo.update(id, { avatarUrl: url });
    return this.sanitize(updated);
  }

  async incrementCounter(id: string, field: 'followerCount' | 'followingCount' | 'postCount', delta: number) {
    return this.repo.incrementCounter(id, field, delta);
  }

  sanitize(user: User): PublicUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, email, ...pub } = user;
    return pub;
  }
}
