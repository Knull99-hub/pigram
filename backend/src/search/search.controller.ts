import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  search(@Query('q') q: string) {
    if (!q || q.trim().length < 1) return { users: [], posts: [] };
    return this.searchService.search(q.trim());
  }
}
