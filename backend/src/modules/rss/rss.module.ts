import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { ElasticsearchModule } from "../elasticsearch/elasticsearch.module";
import { UserModule } from "../user/user.module";
import { RssController } from "./rss.controller";
import { RssService } from "./rss.service";

@Module({
  imports: [DatabaseModule, ElasticsearchModule, UserModule],
  controllers: [RssController],
  providers: [RssService],
})
export class RssModule {}
