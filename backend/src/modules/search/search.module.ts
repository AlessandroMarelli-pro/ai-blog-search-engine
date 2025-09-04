import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { ElasticsearchModule } from "../elasticsearch/elasticsearch.module";
import { UserModule } from "../user/user.module";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

@Module({
  imports: [DatabaseModule, ElasticsearchModule, UserModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
