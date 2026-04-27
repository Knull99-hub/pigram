import { Controller, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('likes')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LikesController {
  constructor(private likesService: LikesService) {}

  @Post(':id/like')
  like(@CurrentUser() user: any, @Param('id') postId: string) {
    return this.likesService.like(postId, user.id);
  }

  @Delete(':id/like')
  unlike(@CurrentUser() user: any, @Param('id') postId: string) {
    return this.likesService.unlike(postId, user.id);
  }
}
