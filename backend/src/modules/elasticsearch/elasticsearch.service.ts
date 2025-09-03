import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private client: Client;
  private readonly indexName = 'blog-posts';

  constructor(private configService: ConfigService) {
    this.client = new Client({
      node: this.configService.get<string>('ELASTICSEARCH_NODE'),
      auth: {
        username: this.configService.get<string>('ELASTICSEARCH_USERNAME'),
        password: this.configService.get<string>('ELASTICSEARCH_PASSWORD'),
      },
    });
  }

  async onModuleInit() {
    await this.createIndexIfNotExists();
  }

  private async createIndexIfNotExists() {
    try {
      const indexExists = await this.client.indices.exists({
        index: this.indexName,
      });

      if (!indexExists) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            mappings: {
              properties: {
                title: { type: 'text', analyzer: 'standard' },
                description: { type: 'text', analyzer: 'standard' },
                content: { type: 'text', analyzer: 'standard' },
                author: { type: 'keyword' },
                url: { type: 'keyword' },
                source: { type: 'keyword' },
                tags: { type: 'keyword' },
                publishedAt: { type: 'date' },
                createdAt: { type: 'date' },
                // all-MiniLM-L6-v2 => 384 dimensions
                embedding: { type: 'dense_vector', dims: 384, index: true, similarity: 'cosine' },
              },
            },
          } as any,
        });
      }
    } catch (error) {
      console.error('Error creating ElasticSearch index:', error);
    }
  }

  async indexBlogPost(blogPost: any) {
    try {
      return await this.client.index({
        index: this.indexName,
        id: blogPost.id,
        body: {
          title: blogPost.title,
          description: blogPost.description,
          content: blogPost.content,
          author: blogPost.author,
          url: blogPost.url,
          source: blogPost.source,
          tags: blogPost.tags,
          publishedAt: blogPost.publishedAt,
          createdAt: blogPost.createdAt,
          embedding: blogPost.embedding || null,
        },
      });
    } catch (error) {
      console.error('Error indexing blog post:', error);
      throw error;
    }
  }

  async searchBlogPosts(query: string, size: number = 10) {
    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            multi_match: {
              query: query,
              fields: ['title^2', 'description^1.5', 'content', 'tags'],
              type: 'best_fields',
              fuzziness: 'AUTO',
            },
          },
          size: size,
          sort: [
            { publishedAt: { order: 'desc' } },
            { _score: { order: 'desc' } },
          ],
        } as any,
      });

      return response.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
      }));
    } catch (error) {
      console.error('Error searching blog posts:', error);
      return [];
    }
  }

  async vectorSearch(embedding: number[], size: number = 10) {
    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          knn: {
            field: 'embedding',
            query_vector: embedding,
            k: size,
            num_candidates: Math.max(size * 6, 60),
          },
        } as any,
      });

      return response.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
      }));
    } catch (error) {
      console.error('Error vector searching blog posts:', error);
      return [];
    }
  }

  async deleteBlogPost(id: string) {
    try {
      return await this.client.delete({
        index: this.indexName,
        id: id,
      });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  }
}
