import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { ElasticsearchService } from "../elasticsearch/elasticsearch.service";
import { SearchRequestDto } from "./dto/search-request.dto";

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  async searchBlogPosts(searchRequest: SearchRequestDto, userId?: string) {
    const { query, limit = 10 } = searchRequest;

    try {
      // Log the search query
      await this.prisma.searchQuery.create({
        data: {
          query,
          userId,
        },
      });

      // Search in ElasticSearch
      const searchResults = await this.elasticsearchService.searchBlogPosts(
        query,
        limit
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
      console.error("Search error:", error);
      throw new Error("Failed to perform search");
    }
  }

  async searchBlogPostsByVector(
    searchRequest: SearchRequestDto,
    userId?: string
  ) {
    const { query, limit = 10 } = searchRequest;

    try {
      // Log the search query
      await this.prisma.searchQuery.create({
        data: {
          query,
          userId,
        },
      });

      // Search in ElasticSearch
      const searchResults =
        await this.elasticsearchService.searchBlogPostsByVector(query, limit);

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
      console.error("Search error:", error);
      throw new Error("Failed to perform search");
    }
  }

  async searchBlogPostsSemantic(
    searchRequest: SearchRequestDto,
    userId?: string
  ) {
    const { query, limit = 10 } = searchRequest;

    try {
      // Log the search query
      await this.prisma.searchQuery.create({
        data: {
          query,
          userId,
        },
      });

      // Search in ElasticSearch with semantic understanding
      const searchResults =
        await this.elasticsearchService.searchBlogPostsSemantic(query, limit);

      // Get semantic analysis from the Python script
      const semanticAnalysis = await this.getSemanticAnalysis(query);

      // Update search query with results count
      await this.prisma.searchQuery.updateMany({
        where: { query },
        data: { results: searchResults.length },
      });

      return {
        query,
        totalResults: searchResults.length,
        results: searchResults,
        searchType: "semantic",
        semantic_analysis: semanticAnalysis,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Semantic search error:", error);
      throw new Error("Failed to perform semantic search");
    }
  }

  private async getSemanticAnalysis(query: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const { spawn } = require("child_process");
      const enableDebug = process.env.PYTHON_DEBUG === "1";

      const pythonProcess = spawn(
        "python3",
        [
          "scripts/semantic_search.py",
          "--query",
          query,
          "--analysis-only",
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
        data += chunk.toString();
      });

      pythonProcess.stderr.on("data", (chunk) => {
        error += chunk.toString();
      });

      pythonProcess.on("error", (procErr) => {
        reject(procErr);
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Semantic analysis failed: ${error}`));
          return;
        }

        try {
          const result = JSON.parse(data);
          resolve(result.semantic_analysis || {});
        } catch (parseError) {
          reject(
            new Error(
              `Failed to parse semantic analysis: ${parseError.message}`
            )
          );
        }
      });
    });
  }

  async getSearchHistory(limit: number = 10) {
    return await this.prisma.searchQuery.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }
}
