import {
  Controller, Get, Patch, Post, Delete, Param, Body,
  UseGuards, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { FollowsService } from '../follows/follows.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService, private followsService: FollowsService) {}

  @Get(':username')
  getProfile(@Param('username') username: string) {
    return this.usersService.getProfile(username);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.updateAvatar(user.id, file);
  }

  @Get(':id/followers')
  getFollowers(@Param('id') id: string) {
    return this.followsService.getFollowers(id);
  }

  @Get(':id/following')
  getFollowing(@Param('id') id: string) {
    return this.followsService.getFollowing(id);
  }

  @Get(':id/follow/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  followStatus(@CurrentUser() user: any, @Param('id') targetId: string) {
    return this.followsService.isFollowing(user.id, targetId).then((following) => ({ following }));
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  follow(@CurrentUser() user: any, @Param('id') targetId: string) {
    return this.followsService.follow(user.id, targetId);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  unfollow(@CurrentUser() user: any, @Param('id') targetId: string) {
    return this.followsService.unfollow(user.id, targetId);
  }
}
