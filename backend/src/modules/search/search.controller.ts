import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchRequestDto } from './dto/search-request.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async search(@Body() searchRequest: SearchRequestDto) {
    return await this.searchService.searchBlogPosts(searchRequest);
  }

  @Get()
  async searchGet(@Query('q') query: string, @Query('limit') limit?: number) {
    return await this.searchService.searchBlogPosts({
      query,
      limit: limit || 10,
    });
  }

  @Get('health')
  async health() {
    return { status: 'ok', message: 'Search service is running' };
  }
}
