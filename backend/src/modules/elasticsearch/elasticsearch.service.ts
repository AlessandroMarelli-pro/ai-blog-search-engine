import { Client } from "@elastic/elasticsearch";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { spawn } from "child_process";

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);

  private client: Client;
  private readonly indexName = "blog-posts";

  constructor(private configService: ConfigService) {
    this.client = new Client({
      node: this.configService.get<string>("ELASTICSEARCH_NODE"),
      auth: {
        username: this.configService.get<string>("ELASTICSEARCH_USERNAME"),
        password: this.configService.get<string>("ELASTICSEARCH_PASSWORD"),
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
                title: { type: "text", analyzer: "standard" },
                description: { type: "text", analyzer: "standard" },
                content: { type: "text", analyzer: "standard" },
                author: { type: "keyword" },
                url: { type: "keyword" },
                source: { type: "keyword" },
                tags: { type: "keyword" },
                publishedAt: { type: "date" },
                createdAt: { type: "date" },
                // all-MiniLM-L6-v2 => 384 dimensions
                embedding: {
                  type: "dense_vector",
                  dims: 384,
                  index: true,
                  similarity: "cosine",
                },
              },
            },
          } as any,
        });
      }
    } catch (error) {
      console.error("Error creating ElasticSearch index:", error);
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
      console.error("Error indexing blog post:", error);
      throw error;
    }
  }

  async searchBlogPosts(query: string, size: number = 10) {
    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            bool: {
              should: [
                // Exact phrase match (highest priority)
                {
                  multi_match: {
                    query: query,
                    fields: ["title^3", "description^2", "content", "tags^2"],
                    type: "phrase",
                    boost: 3,
                  },
                },
                // Term matching (medium priority)
                {
                  multi_match: {
                    query: query,
                    fields: ["title^2", "description^1.5", "content", "tags"],
                    type: "best_fields",
                    fuzziness: "AUTO",
                    boost: 1,
                  },
                },
                // Partial matching (lower priority)
                {
                  multi_match: {
                    query: query,
                    fields: ["title^1.5", "description", "content", "tags"],
                    type: "most_fields",
                    boost: 0.5,
                  },
                },
              ],
              minimum_should_match: 1,
            },
          },
          size: size * 2, // Get more results to filter by score
          sort: [
            { _score: { order: "desc" } },
            { publishedAt: { order: "desc" } },
          ],
          min_score: 13, // Increased minimum score threshold for better relevance
        } as any,
      });

      // Filter and limit results
      const hits = response.hits.hits
        .filter((hit: any) => hit._score >= 3.0)
        .slice(0, size);

      return hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
      }));
    } catch (error) {
      console.error("Error searching blog posts:", error);
      return [];
    }
  }

  async embedText(query: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const enableDebug = process.env.PYTHON_DEBUG === "1";

      const pythonProcess = spawn(
        "python3",
        [
          "scripts/embed_text.py",
          "--query",
          query,
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
          const embeddings = JSON.parse(data);

          resolve(embeddings);
        } catch (parseError: any) {
          this.logger.error(`Failed to parse RSS data: ${parseError.message}`);
          reject(new Error(`Failed to parse RSS data: ${parseError.message}`));
        }
      });
    });
  }

  async searchBlogPostsByVector(query: string, size: number = 10) {
    try {
      const embeddings = await this.embedText(query);
      return this.vectorSearch(embeddings, size);
    } catch (error) {
      console.error("Error searchBlogPostsByVector:", error);
      return [];
    }
  }

  async vectorSearch(embedding: number[], size: number = 10) {
    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          knn: {
            field: "embedding",
            query_vector: embedding,
            k: size,
            num_candidates: Math.max(size * 6, 60),
          },
          sort: [
            { _score: { order: "desc" } },
            { publishedAt: { order: "desc" } },
          ],
          size,
        } as any,
      });

      return response.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
      }));
    } catch (error) {
      console.error("Error vector searching blog posts:", error);
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
      console.error("Error deleting blog post:", error);
      throw error;
    }
  }

  async searchBlogPostsSemantic(query: string, size: number = 10) {
    try {
      // First, get initial results with broad search
      const initialResults = await this.searchBlogPosts(query, size * 3);

      if (initialResults.length === 0) {
        return [];
      }

      // Save results to temporary file for Python processing
      const fs = require("fs");
      const tempFile = `/tmp/search_results_${Date.now()}.json`;

      try {
        fs.writeFileSync(tempFile, JSON.stringify(initialResults));

        // Call Python semantic search script
        const semanticResults = await this.runSemanticSearch(query, tempFile);

        // Clean up temp file
        fs.unlinkSync(tempFile);

        return semanticResults;
      } catch (error) {
        this.logger.error(`Error in semantic search: ${error}`);
        // Fallback to regular search
        return initialResults.slice(0, size);
      }
    } catch (error) {
      console.error("Error in semantic search:", error);
      return [];
    }
  }

  private async runSemanticSearch(
    query: string,
    resultsFile: string
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const enableDebug = process.env.PYTHON_DEBUG === "1";

      const pythonProcess = spawn(
        "python3",
        [
          "scripts/semantic_search.py",
          "--query",
          query,
          "--results",
          resultsFile,
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
          this.logger.debug(`[semantic stdout] ${text.trim()}`);
        }
        data += text;
      });

      pythonProcess.stderr.on("data", (chunk) => {
        const text = chunk.toString();
        this.logger.warn(`[semantic stderr] ${text.trim()}`);
        error += text;
      });

      pythonProcess.on("error", (procErr) => {
        this.logger.error(
          `Semantic search process error: ${(procErr as Error).message}`
        );
        reject(procErr);
      });

      pythonProcess.on("close", async (code) => {
        if (code !== 0) {
          reject(new Error(`Semantic search failed (exit ${code}): ${error}`));
          return;
        }

        try {
          const result = JSON.parse(data);
          resolve(result.ranked_results || []);
        } catch (parseError: any) {
          this.logger.error(
            `Failed to parse semantic search results: ${parseError.message}`
          );
          reject(
            new Error(
              `Failed to parse semantic search results: ${parseError.message}`
            )
          );
        }
      });
    });
  }
}
