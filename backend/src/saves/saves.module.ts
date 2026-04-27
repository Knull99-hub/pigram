import { Module } from '@nestjs/common';
import { SavesController } from './saves.controller';
import { SavesService } from './saves.service';
import { SavesRepository } from './saves.repository';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [PostsModule],
  controllers: [SavesController],
  providers: [SavesService, SavesRepository],
  exports: [SavesService],
})
export class SavesModule {}
