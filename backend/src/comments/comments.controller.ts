import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('posts/:id/comments')
  getComments(@Param('id') postId: string) {
    return this.commentsService.getByPost(postId);
  }

  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createComment(@CurrentUser() user: any, @Param('id') postId: string, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(postId, user.id, dto.content);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteComment(@CurrentUser() user: any, @Param('id') commentId: string) {
    return this.commentsService.delete(commentId, user.id);
  }
}
