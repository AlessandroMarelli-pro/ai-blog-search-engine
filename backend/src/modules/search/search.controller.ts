import { Body, Controller, Get, Optional, Post, Query } from "@nestjs/common";
import { Auth0User } from "../../decorators/user.decorator";
import { UserService } from "../user/user.service";
import { SearchRequestDto } from "./dto/search-request.dto";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly userService: UserService
  ) {}

  @Post()
  async search(
    @Body() searchRequest: SearchRequestDto,
    @Optional() @Auth0User() auth0User?: any
  ) {
    const userId = auth0User
      ? (await this.userService.findOrCreateUser(auth0User)).id
      : undefined;
    return await this.searchService.searchBlogPosts(searchRequest, userId);
  }

  @Get()
  async searchGet(
    @Query("q") query: string,
    @Query("limit") limit?: number,
    @Optional() @Auth0User() auth0User?: any
  ) {
    const userId = auth0User
      ? (await this.userService.findOrCreateUser(auth0User)).id
      : undefined;
    return await this.searchService.searchBlogPosts(
      {
        query,
        limit: limit || 10,
      },
      userId
    );
  }

  @Get("vector")
  async searchVector(
    @Query("q") query: string,
    @Query("limit") limit?: number,
    @Optional() @Auth0User() auth0User?: any
  ) {
    const userId = auth0User
      ? (await this.userService.findOrCreateUser(auth0User)).id
      : undefined;
    return await this.searchService.searchBlogPostsByVector(
      {
        query,
        limit: limit || 10,
      },
      userId
    );
  }

  @Get("semantic")
  async searchSemantic(
    @Query("q") query: string,
    @Query("limit") limit?: number,
    @Optional() @Auth0User() auth0User?: any
  ) {
    const userId = auth0User
      ? (await this.userService.findOrCreateUser(auth0User)).id
      : undefined;
    return await this.searchService.searchBlogPostsSemantic(
      {
        query,
        limit: limit || 10,
      },
      userId
    );
  }

  @Get("health")
  async health() {
    return { status: "ok", message: "Search service is running" };
  }

  // Return the history of searches
  @Get("history")
  async getSearchHistory() {
    return await this.searchService.getSearchHistory();
  }
}
