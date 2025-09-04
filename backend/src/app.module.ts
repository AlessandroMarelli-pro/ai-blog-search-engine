import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./modules/database/database.module";
import { ElasticsearchModule } from "./modules/elasticsearch/elasticsearch.module";
import { RssModule } from "./modules/rss/rss.module";
import { SearchModule } from "./modules/search/search.module";
import { UserModule } from "./modules/user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    DatabaseModule,
    ElasticsearchModule,
    SearchModule,
    RssModule,
    UserModule,
  ],
})
export class AppModule {}
