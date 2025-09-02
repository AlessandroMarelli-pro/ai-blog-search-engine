import { Module } from '@nestjs/common';
import { RssController } from './rss.controller';
import { RssService } from './rss.service';
import { DatabaseModule } from '../database/database.module';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';

@Module({
  imports: [DatabaseModule, ElasticsearchModule],
  controllers: [RssController],
  providers: [RssService],
})
export class RssModule {}
