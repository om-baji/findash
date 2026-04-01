import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '../common/role.enum';
import { CurrentUser } from '../shared/current-user.decorator';
import type { RequestUser } from '../shared/request-user.interface';
import { Roles } from '../shared/roles.decorator';
import { CreateRecordDto } from './dto/create-record.dto';
import { FilterRecordsDto } from './dto/filter-records.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordsService } from './records.service';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  @Roles(Role.Admin)
  create(
    @Body() createRecordDto: CreateRecordDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.recordsService.create(createRecordDto, user.id);
  }

  @Get()
  @Roles(Role.Analyst, Role.Admin)
  findAll(@Query() filters: FilterRecordsDto) {
    return this.recordsService.findAll(filters);
  }

  @Get(':id')
  @Roles(Role.Analyst, Role.Admin)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recordsService.findByIdOrFail(id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecordDto: UpdateRecordDto,
  ) {
    return this.recordsService.update(id, updateRecordDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.recordsService.remove(id);
    return { success: true };
  }
}
