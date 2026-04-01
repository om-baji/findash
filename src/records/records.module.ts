import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RecordsController } from './records.controller';
import { RecordsRepository } from './records.repository';
import { RecordsService } from './records.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RecordsController],
  providers: [RecordsRepository, RecordsService],
  exports: [RecordsRepository, RecordsService],
})
export class RecordsModule {}
