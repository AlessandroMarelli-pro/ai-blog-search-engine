import { Injectable, Logger } from "@nestjs/common";
import { spawn } from "child_process";
import { PrismaService } from "../database/prisma.service";
import { ElasticsearchService } from "../elasticsearch/elasticsearch.service";
import { AddRssFeedDto } from "./dto/add-rss-feed.dto";

@Injectable()
export class RssService {
  private readonly logger = new Logger(RssService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  async addRssFeed(addRssFeedDto: AddRssFeedDto) {
    const { name, url } = addRssFeedDto;

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
      },
    });
  }

  async getRssFeeds() {
    return await this.prisma.rssFeed.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async fetchRssFeed(id: string) {
    const feed = await this.prisma.rssFeed.findUnique({
      where: { id },
    });

    if (!feed) {
      throw new Error("RSS feed not found");
    }

    return await this.fetchRssData(feed.url, feed.name);
  }

  async fetchAllRssFeeds() {
    const feeds = await this.prisma.rssFeed.findMany({
      where: { isActive: true },
    });

    const results = [];
    for (const feed of feeds) {
      try {
        const result = await this.fetchRssData(feed.url, feed.name);
        results.push({ feed: feed.name, ...result });
      } catch (error) {
        results.push({ feed: feed.name, error: (error as Error).message });
      }
    }

    return results;
  }

  private async fetchRssData(url: string, source: string): Promise<any> {
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

          await this.prisma.rssFeed.updateMany({
            where: { url },
            data: { lastFetch: new Date() },
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
      },
    });

    await this.elasticsearchService.indexBlogPost({
      ...blogPost,
      embedding: postData.embedding || null,
    });

    return blogPost;
  }
}
