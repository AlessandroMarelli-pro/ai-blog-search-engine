import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { DatabaseModule } from '../database/database.module';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';

@Module({
  imports: [DatabaseModule, ElasticsearchModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
