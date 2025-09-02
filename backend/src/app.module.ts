import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchModule } from './modules/search/search.module';
import { RssModule } from './modules/rss/rss.module';
import { DatabaseModule } from './modules/database/database.module';
import { ElasticsearchModule } from './modules/elasticsearch/elasticsearch.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DatabaseModule,
    ElasticsearchModule,
    SearchModule,
    RssModule,
  ],
})
export class AppModule {}
