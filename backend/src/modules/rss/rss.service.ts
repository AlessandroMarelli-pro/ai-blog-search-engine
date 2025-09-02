import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { AddRssFeedDto } from './dto/add-rss-feed.dto';
import { spawn } from 'child_process';

@Injectable()
export class RssService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async addRssFeed(addRssFeedDto: AddRssFeedDto) {
    const { name, url } = addRssFeedDto;

    const existingFeed = await this.prisma.rssFeed.findUnique({
      where: { url },
    });

    if (existingFeed) {
      throw new Error('RSS feed already exists');
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async fetchRssFeed(id: string) {
    const feed = await this.prisma.rssFeed.findUnique({
      where: { id },
    });

    if (!feed) {
      throw new Error('RSS feed not found');
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
        results.push({ feed: feed.name, error: error.message });
      }
    }

    return results;
  }

  private async fetchRssData(url: string, source: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // This will call a Python script to fetch RSS data
      const pythonProcess = spawn('python3', [
        'scripts/fetch_rss.py',
        '--url', url,
        '--source', source,
      ]);

      let data = '';
      let error = '';

      pythonProcess.stdout.on('data', (chunk) => {
        data += chunk.toString();
      });

      pythonProcess.stderr.on('data', (chunk) => {
        error += chunk.toString();
      });

      pythonProcess.on('close', async (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed: ${error}`));
          return;
        }

        try {
          const posts = JSON.parse(data);
          
          // Save posts to database and index in ElasticSearch
          const savedPosts = [];
          for (const post of posts) {
            const savedPost = await this.saveBlogPost(post, source);
            savedPosts.push(savedPost);
          }

          // Update feed last fetch time
          await this.prisma.rssFeed.updateMany({
            where: { url },
            data: { lastFetch: new Date() },
          });

          resolve({
            success: true,
            postsProcessed: savedPosts.length,
            posts: savedPosts,
          });
        } catch (parseError) {
          reject(new Error(`Failed to parse RSS data: ${parseError.message}`));
        }
      });
    });
  }

  private async saveBlogPost(postData: any, source: string) {
    // Save to database
    const blogPost = await this.prisma.blogPost.upsert({
      where: { url: postData.url },
      update: {
        title: postData.title,
        description: postData.description,
        content: postData.content,
        author: postData.author,
        publishedAt: postData.publishedAt ? new Date(postData.publishedAt) : null,
        tags: postData.tags || [],
      },
      create: {
        title: postData.title,
        description: postData.description,
        content: postData.content,
        author: postData.author,
        url: postData.url,
        source,
        publishedAt: postData.publishedAt ? new Date(postData.publishedAt) : null,
        tags: postData.tags || [],
      },
    });

    // Index in ElasticSearch
    await this.elasticsearchService.indexBlogPost(blogPost);

    return blogPost;
  }
}
