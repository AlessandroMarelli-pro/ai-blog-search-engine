import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(auth0User: any) {
    const {
      sub: auth0Id,
      email,
      given_name: firstName,
      family_name: lastName,
    } = auth0User;

    let user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          auth0Id,
          email,
          firstName: firstName || "Unknown",
          lastName: lastName || "User",
          themes: [],
          tags: [],
          language: "en",
        },
      });
      this.logger.log(`Created new user: ${user.email}`);
    }

    return user;
  }

  async getUserProfile(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRssFeeds: {
          include: {
            rssFeed: true,
          },
        },
        favorites: {
          include: {
            blogPost: true,
          },
        },
        searchHistory: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  async updateUserProfile(
    userId: string,
    updateData: {
      firstName?: string;
      lastName?: string;
      age?: number;
      position?: string;
      themes?: string[];
      tags?: string[];
      language?: string;
    }
  ) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async getUserSearchHistory(userId: string, limit: number = 20) {
    return await this.prisma.searchQuery.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async addToFavorites(userId: string, blogPostId: string) {
    return await this.prisma.favorite.create({
      data: {
        userId,
        blogPostId,
      },
      include: {
        blogPost: true,
      },
    });
  }

  async removeFromFavorites(userId: string, blogPostId: string) {
    return await this.prisma.favorite.delete({
      where: {
        userId_blogPostId: {
          userId,
          blogPostId,
        },
      },
    });
  }

  async getFavorites(userId: string) {
    return await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        blogPost: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async isFavorite(userId: string, blogPostId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_blogPostId: {
          userId,
          blogPostId,
        },
      },
    });
    return !!favorite;
  }
}
