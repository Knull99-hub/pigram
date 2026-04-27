import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { LikesRepository } from './likes.repository';
import { PostsModule } from '../posts/posts.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PostsModule, NotificationsModule],
  controllers: [LikesController],
  providers: [LikesService, LikesRepository],
  exports: [LikesService],
})
export class LikesModule {}
