import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { Auth0User } from "../../decorators/user.decorator";
import { Auth0Guard } from "../../guards/auth0.guard";
import { UserService } from "./user.service";

@Controller("users")
@UseGuards(Auth0Guard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("profile")
  async getProfile(@Auth0User() auth0User: any) {
    const user = await this.userService.findOrCreateUser(auth0User);
    return await this.userService.getUserProfile(user.id);
  }

  @Put("profile")
  async updateProfile(
    @Auth0User() auth0User: any,
    @Body()
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
    const user = await this.userService.findOrCreateUser(auth0User);
    return await this.userService.updateUserProfile(user.id, updateData);
  }

  @Get("search-history")
  async getSearchHistory(@Auth0User() auth0User: any) {
    const user = await this.userService.findOrCreateUser(auth0User);
    return await this.userService.getUserSearchHistory(user.id);
  }

  @Post("favorites/:blogPostId")
  async addToFavorites(
    @Auth0User() auth0User: any,
    @Param("blogPostId") blogPostId: string
  ) {
    const user = await this.userService.findOrCreateUser(auth0User);
    return await this.userService.addToFavorites(user.id, blogPostId);
  }

  @Post("favorites/:blogPostId/remove")
  async removeFromFavorites(
    @Auth0User() auth0User: any,
    @Param("blogPostId") blogPostId: string
  ) {
    const user = await this.userService.findOrCreateUser(auth0User);
    return await this.userService.removeFromFavorites(user.id, blogPostId);
  }

  @Get("favorites")
  async getFavorites(@Auth0User() auth0User: any) {
    const user = await this.userService.findOrCreateUser(auth0User);
    return await this.userService.getFavorites(user.id);
  }

  @Get("favorites/:blogPostId/check")
  async checkFavorite(
    @Auth0User() auth0User: any,
    @Param("blogPostId") blogPostId: string
  ) {
    const user = await this.userService.findOrCreateUser(auth0User);
    return {
      isFavorite: await this.userService.isFavorite(user.id, blogPostId),
    };
  }
}
