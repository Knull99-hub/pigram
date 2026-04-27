import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { PostsModule } from '../posts/posts.module';
import { FollowsModule } from '../follows/follows.module';
import { LikesModule } from '../likes/likes.module';
import { SavesModule } from '../saves/saves.module';

@Module({
  imports: [PostsModule, FollowsModule, LikesModule, SavesModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
