import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Auth0User } from "../../decorators/user.decorator";
import { Auth0Guard } from "../../guards/auth0.guard";
import { UserService } from "../user/user.service";
import { AddRssFeedDto } from "./dto/add-rss-feed.dto";
import { RssService } from "./rss.service";

@Controller("rss")
export class RssController {
  constructor(
    private readonly rssService: RssService,
    private readonly userService: UserService
  ) {}

  @Post("feeds")
  async addRssFeed(@Body() addRssFeedDto: AddRssFeedDto) {
    return await this.rssService.addRssFeed(addRssFeedDto);
  }

  @Get("feeds")
  async getRssFeeds() {
    return await this.rssService.getRssFeeds();
  }

  @Post("fetch/:id")
  async fetchRssFeed(@Param("id") id: string) {
    return await this.rssService.fetchRssFeed(id);
  }

  @Post("fetch-all")
  async fetchAllRssFeeds() {
    return await this.rssService.fetchAllRssFeeds();
  }

  @Delete("feeds/:id")
  async deleteRssFeed(@Param("id") id: string) {
    return await this.rssService.deleteRssFeed(id);
  }

  @Get("feeds/theme/:theme")
  async getRssFeedsByTheme(@Param("theme") theme: string) {
    return await this.rssService.getRssFeedsByTheme(theme);
  }

  @Get("user/feeds")
  @UseGuards(Auth0Guard)
  async getUserRssFeeds(@Auth0User() auth0User: any) {
    const user = await this.userService.findOrCreateUser(auth0User);
    return await this.rssService.getUserRssFeeds(user.id);
  }

  @Post("user/feeds/:rssFeedId")
  @UseGuards(Auth0Guard)
  async addUserRssFeed(
    @Auth0User() auth0User: any,
    @Param("rssFeedId") rssFeedId: string
  ) {
    const user = await this.userService.findOrCreateUser(auth0User);
    return await this.rssService.addUserRssFeed(user.id, rssFeedId);
  }

  @Delete("user/feeds/:rssFeedId")
  @UseGuards(Auth0Guard)
  async removeUserRssFeed(
    @Auth0User() auth0User: any,
    @Param("rssFeedId") rssFeedId: string
  ) {
    const user = await this.userService.findOrCreateUser(auth0User);
    return await this.rssService.removeUserRssFeed(user.id, rssFeedId);
  }

  @Get("user/recommendations")
  @UseGuards(Auth0Guard)
  async getRecommendedRssFeeds(@Auth0User() auth0User: any) {
    const user = await this.userService.findOrCreateUser(auth0User);
    return await this.rssService.getRecommendedRssFeeds(user.id);
  }

  @Get("health")
  async health() {
    return { status: "ok", message: "RSS service is running" };
  }
}
