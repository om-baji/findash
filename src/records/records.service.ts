import { Injectable, NotFoundException } from '@nestjs/common';
import { FinancialRecordEntity } from '../common/entities';
import { FilterRecordsDto } from './dto/filter-records.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordsRepository } from './records.repository';

@Injectable()
export class RecordsService {
  constructor(private readonly recordsRepository: RecordsRepository) {}

  async create(
    createRecordDto: CreateRecordDto,
    userId: number,
  ): Promise<FinancialRecordEntity> {
    const now = new Date().toISOString();

    return this.recordsRepository.create({
      ...createRecordDto,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  }

  async findAll(filters: FilterRecordsDto) {
    const records = await this.recordsRepository.findAll();
    const filtered = records.filter((record) => {
      if (filters.type && record.type !== filters.type) {
        return false;
      }

      if (filters.category && record.category !== filters.category) {
        return false;
      }

      if (filters.startDate && record.date < filters.startDate) {
        return false;
      }

      if (filters.endDate && record.date > filters.endDate) {
        return false;
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        const notes = record.notes?.toLowerCase() ?? '';
        const category = record.category.toLowerCase();
        if (!notes.includes(query) && !category.includes(query)) {
          return false;
        }
      }

      return true;
    });

    filtered.sort((a, b) => b.date.localeCompare(a.date));

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total: filtered.length,
      },
    };
  }

  async findByIdOrFail(id: number): Promise<FinancialRecordEntity> {
    const record = await this.recordsRepository.findById(id);
    if (!record) {
      throw new NotFoundException(`Record ${id} was not found`);
    }

    return record;
  }

  async update(
    id: number,
    dto: UpdateRecordDto,
  ): Promise<FinancialRecordEntity> {
    await this.findByIdOrFail(id);
    const updated = await this.recordsRepository.update(id, dto);

    if (!updated) {
      throw new NotFoundException(`Record ${id} was not found`);
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    const removed = await this.recordsRepository.remove(id);
    if (!removed) {
      throw new NotFoundException(`Record ${id} was not found`);
    }
  }
}
