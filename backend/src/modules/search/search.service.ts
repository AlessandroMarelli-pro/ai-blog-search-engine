import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { SearchRequestDto } from './dto/search-request.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async searchBlogPosts(searchRequest: SearchRequestDto) {
    const { query, limit = 10 } = searchRequest;

    try {
      // Log the search query
      await this.prisma.searchQuery.create({
        data: {
          query,
        },
      });

      // Search in ElasticSearch
      const searchResults = await this.elasticsearchService.searchBlogPosts(
        query,
        limit,
      );

      // Update search query with results count
      await this.prisma.searchQuery.updateMany({
        where: { query },
        data: { results: searchResults.length },
      });

      return {
        query,
        totalResults: searchResults.length,
        results: searchResults,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to perform search');
    }
  }

  async getSearchHistory(limit: number = 10) {
    return await this.prisma.searchQuery.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
