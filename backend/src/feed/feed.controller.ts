import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('feed')
@Controller('posts')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getFeed(@CurrentUser() user: any, @Query('limit') limit = 20, @Query('offset') offset = 0) {
    return this.feedService.getFeed(user.id, +limit, +offset);
  }
}
