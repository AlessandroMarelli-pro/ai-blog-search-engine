import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { SearchRequestDto } from "./dto/search-request.dto";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async search(@Body() searchRequest: SearchRequestDto) {
    return await this.searchService.searchBlogPosts(searchRequest);
  }

  @Get()
  async searchGet(@Query("q") query: string, @Query("limit") limit?: number) {
    return await this.searchService.searchBlogPostsByVector({
      query,
      limit: limit || 10,
    });
  }

  @Get("health")
  async health() {
    return { status: "ok", message: "Search service is running" };
  }
}
