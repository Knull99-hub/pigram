import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  UseGuards, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get('discover')
  getDiscover(@Query('limit') limit = 20, @Query('offset') offset = 0) {
    return this.postsService.getDiscover(+limit, +offset);
  }

  @Get('user/:userId')
  getByUser(@Param('userId') userId: string, @Query('limit') limit = 20, @Query('offset') offset = 0) {
    return this.postsService.findByUser(userId, +limit, +offset);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.postsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Creator)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @CurrentUser() user: any,
    @Body() dto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.postsService.create(user.id, dto, file);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.postsService.delete(id, user.id);
  }
}
