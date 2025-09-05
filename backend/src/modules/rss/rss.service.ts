import { Injectable, Logger } from "@nestjs/common";
import { RssFeed } from "@prisma/client";
import { spawn } from "child_process";
import { PrismaService } from "../database/prisma.service";
import { ElasticsearchService } from "../elasticsearch/elasticsearch.service";
import { UserService } from "../user/user.service";
import { AddRssFeedDto } from "./dto/add-rss-feed.dto";

@Injectable()
export class RssService {
  private readonly logger = new Logger(RssService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly userService: UserService
  ) {}

  async addRssFeed(addRssFeedDto: AddRssFeedDto) {
    const { name, url, themes, tags } = addRssFeedDto;

    const existingFeed = await this.prisma.rssFeed.findUnique({
      where: { url },
    });

    if (existingFeed) {
      throw new Error("RSS feed already exists");
    }

    return await this.prisma.rssFeed.create({
      data: {
        name,
        url,
        themes,
        tags,
      },
    });
  }

  async getRssFeeds() {
    return await this.prisma.rssFeed.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getRssFeedsByTheme(theme: string) {
    return await this.prisma.rssFeed.findMany({
      where: { themes: { has: theme } },
      orderBy: { createdAt: "desc" },
    });
  }

  async getUserRssFeeds(userId: string) {
    return await this.prisma.userRssFeed.findMany({
      where: { userId, isActive: true },
      include: {
        rssFeed: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async addUserRssFeed(userId: string, rssFeedId: string) {
    // Check if RSS feed exists
    const rssFeed = await this.prisma.rssFeed.findUnique({
      where: { id: rssFeedId },
    });

    if (!rssFeed) {
      throw new Error("RSS feed not found");
    }

    // Check if user already has this RSS feed
    const existingUserRssFeed = await this.prisma.userRssFeed.findUnique({
      where: {
        userId_rssFeedId: {
          userId,
          rssFeedId,
        },
      },
    });

    if (existingUserRssFeed) {
      // If exists but inactive, activate it
      if (!existingUserRssFeed.isActive) {
        return await this.prisma.userRssFeed.update({
          where: { id: existingUserRssFeed.id },
          data: { isActive: true },
          include: { rssFeed: true },
        });
      }
      throw new Error("User already has this RSS feed");
    }

    return await this.prisma.userRssFeed.create({
      data: {
        userId,
        rssFeedId,
      },
      include: {
        rssFeed: true,
      },
    });
  }

  async removeUserRssFeed(userId: string, rssFeedId: string) {
    const userRssFeed = await this.prisma.userRssFeed.findUnique({
      where: {
        userId_rssFeedId: {
          userId,
          rssFeedId,
        },
      },
    });

    if (!userRssFeed) {
      throw new Error("User RSS feed not found");
    }

    return await this.prisma.userRssFeed.update({
      where: { id: userRssFeed.id },
      data: { isActive: false },
      include: { rssFeed: true },
    });
  }

  async getRecommendedRssFeeds(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.themes.length) {
      // Return popular feeds if no themes
      return await this.prisma.rssFeed.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    }

    // Return feeds matching user themes
    return await this.prisma.rssFeed.findMany({
      where: {
        isActive: true,
        themes: {
          hasSome: user.themes,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }

  async deleteRssFeed(id: string) {
    // First, get the RSS feed to get its name (source)
    const feed = await this.prisma.rssFeed.findUnique({
      where: { id },
    });

    if (!feed) {
      throw new Error("RSS feed not found");
    }

    // Delete all blog posts from the database that belong to this RSS feed
    const deletedPosts = await this.prisma.blogPost.deleteMany({
      where: { source: feed.name },
    });

    // Delete all blog posts from Elasticsearch that belong to this RSS feed
    await this.elasticsearchService.deleteBlogPostsBySource(feed.name);

    // Finally, delete the RSS feed itself
    const deletedFeed = await this.prisma.rssFeed.delete({
      where: { id },
    });

    return {
      deletedFeed,
      deletedPostsCount: deletedPosts.count,
      message: `Successfully deleted RSS feed '${feed.name}' and ${deletedPosts.count} related blog posts`,
    };
  }

  async fetchRssFeed(id: string) {
    const feed = await this.prisma.rssFeed.findUnique({
      where: { id },
    });

    if (!feed) {
      throw new Error("RSS feed not found");
    }

    return await this.fetchRssData(feed);
  }

  async fetchAllRssFeeds() {
    const feeds = await this.prisma.rssFeed.findMany({
      where: { isActive: true },
    });

    const results = [];
    for (const feed of feeds) {
      try {
        const result = await this.fetchRssData(feed);
        results.push({ feed: feed.name, ...result });
      } catch (error) {
        results.push({ feed: feed.name, error: (error as Error).message });
      }
    }

    return results;
  }

  private async fetchRssData(feed: RssFeed): Promise<any> {
    const { url, name: source } = feed;
    return new Promise((resolve, reject) => {
      const enableDebug = process.env.PYTHON_DEBUG === "1";

      const pythonProcess = spawn(
        "python3",
        [
          "scripts/fetch_rss.py",
          "--url",
          url,
          "--source",
          source,
          ...(enableDebug ? ["--debug"] : []),
        ],
        {
          env: {
            ...process.env,
            PYTHON_DEBUG: enableDebug ? "1" : process.env.PYTHON_DEBUG || "0",
          },
        }
      );

      let data = "";
      let error = "";

      pythonProcess.stdout.on("data", (chunk) => {
        const text = chunk.toString();
        if (enableDebug) {
          this.logger.debug(`[python stdout] ${text.trim()}`);
        }
        data += text;
      });

      pythonProcess.stderr.on("data", (chunk) => {
        const text = chunk.toString();
        // Always surface stderr for visibility
        this.logger.warn(`[python stderr] ${text.trim()}`);
        error += text;
      });

      pythonProcess.on("error", (procErr) => {
        this.logger.error(
          `Python process error: ${(procErr as Error).message}`
        );
        reject(procErr);
      });

      pythonProcess.on("close", async (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed (exit ${code}): ${error}`));
          return;
        }

        try {
          const posts = JSON.parse(data);
          const savedPosts = [] as any[];
          for (const post of posts) {
            const savedPost = await this.saveBlogPost(post, source);
            savedPosts.push(savedPost);
          }

          // Need to add all themes and all tags to the RSS feed
          const themes = savedPosts.map((post) => post.themes).flat();
          const tags = savedPosts.map((post) => post.tags).flat();
          const uniqueThemes = [...new Set(themes.concat(feed.themes || []))];
          const uniqueTags = [...new Set(tags.concat(feed.tags || []))];

          await this.prisma.rssFeed.updateMany({
            where: { url },
            data: {
              lastFetch: new Date(),
              themes: uniqueThemes,
              tags: uniqueTags,
            },
          });

          resolve({
            success: true,
            postsProcessed: savedPosts.length,
            posts: savedPosts,
          });
        } catch (parseError: any) {
          this.logger.error(`Failed to parse RSS data: ${parseError.message}`);
          reject(new Error(`Failed to parse RSS data: ${parseError.message}`));
        }
      });
    });
  }

  private async saveBlogPost(postData: any, source: string) {
    const blogPost = await this.prisma.blogPost.upsert({
      where: { url: postData.url },
      update: {
        title: postData.title,
        description: postData.description,
        content: postData.content,
        author: postData.author,
        publishedAt: postData.publishedAt
          ? new Date(postData.publishedAt)
          : null,
        tags: postData.tags || [],
        themes: postData.themes || [],
      },
      create: {
        title: postData.title,
        description: postData.description,
        content: postData.content,
        author: postData.author,
        url: postData.url,
        source,
        publishedAt: postData.publishedAt
          ? new Date(postData.publishedAt)
          : null,
        tags: postData.tags || [],
        themes: postData.themes || [],
      },
    });

    await this.elasticsearchService.indexBlogPost({
      ...blogPost,
      embedding: postData.embedding || null,
    });

    return blogPost;
  }
}
