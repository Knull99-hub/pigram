import { Module, forwardRef } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsRepository } from './follows.repository';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => UsersModule), forwardRef(() => NotificationsModule)],
  providers: [FollowsService, FollowsRepository],
  exports: [FollowsService],
})
export class FollowsModule {}
