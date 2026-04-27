import { Controller, Post, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SavesService } from './saves.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('saves')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SavesController {
  constructor(private savesService: SavesService) {}

  @Post('posts/:id/save')
  save(@CurrentUser() user: any, @Param('id') postId: string) {
    return this.savesService.save(postId, user.id);
  }

  @Delete('posts/:id/save')
  unsave(@CurrentUser() user: any, @Param('id') postId: string) {
    return this.savesService.unsave(postId, user.id);
  }

  @Get('users/me/saved')
  getSaved(@CurrentUser() user: any) {
    return this.savesService.getSavedPosts(user.id);
  }
}
