import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class RateDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  value: number;
}

@ApiTags('ratings')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post(':id/rate')
  rate(@CurrentUser() user: any, @Param('id') postId: string, @Body() dto: RateDto) {
    return this.ratingsService.rate(postId, user.id, dto.value);
  }

  @Get(':id/rating')
  getMyRating(@CurrentUser() user: any, @Param('id') postId: string) {
    return this.ratingsService.getUserRating(postId, user.id);
  }
}
