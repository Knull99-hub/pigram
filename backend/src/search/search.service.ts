import { Injectable } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SearchService {
  constructor(private postsService: PostsService, private usersService: UsersService) {}

  async search(q: string) {
    const [users, posts] = await Promise.all([
      this.usersService.search(q),
      this.postsService.search(q),
    ]);
    return { users, posts };
  }
}
