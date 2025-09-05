import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { initialThemes } from "../../utils/enums";
import { PrismaService } from "./prisma.service";
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(private prisma: PrismaService) {}

  async onApplicationBootstrap() {
    try {
      // This will throw if DB isn't connected
      await this.prisma.$connect();
      await this.seedStaticData();
    } catch (error) {
      // Handle connection or seeding errors
      console.error("Seeding failed:", error);
      // Optionally: process.exit(1) to prevent startup
    }
  }

  seedStaticData() {
    const themes = initialThemes;
    return this.prisma.theme.createMany({
      data: themes.map((theme) => ({
        name: theme.name,
        nameId: theme.nameId,
        tags: theme.tags.join(","),
      })),
      skipDuplicates: true, // So it does not crash on a duplicate
    });
  }
}
