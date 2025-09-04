import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { AddRssFeedDto } from "./dto/add-rss-feed.dto";
import { RssService } from "./rss.service";

@Controller("rss")
export class RssController {
  constructor(private readonly rssService: RssService) {}

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

  @Get("health")
  async health() {
    return { status: "ok", message: "RSS service is running" };
  }
}
