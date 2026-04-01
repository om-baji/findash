import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { FinancialRecordEntity } from '../common/entities';
import { RecordType } from '../common/record-type.enum';
import { DatabaseService } from '../database/database.service';
import { financialRecordsTable } from '../database/schema';

@Injectable()
export class RecordsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    record: Omit<FinancialRecordEntity, 'id'>,
  ): Promise<FinancialRecordEntity> {
    const [created] = await this.databaseService.client
      .insert(financialRecordsTable)
      .values({
        amount: record.amount.toFixed(2),
        type: record.type,
        category: record.category,
        date: record.date,
        notes: record.notes,
        createdBy: record.createdBy,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
      })
      .returning();

    return this.toEntity(created);
  }

  async findAll(): Promise<FinancialRecordEntity[]> {
    const records = await this.databaseService.client
      .select()
      .from(financialRecordsTable);

    return records.map((record) => this.toEntity(record));
  }

  async findById(id: number): Promise<FinancialRecordEntity | undefined> {
    const [record] = await this.databaseService.client
      .select()
      .from(financialRecordsTable)
      .where(eq(financialRecordsTable.id, id));

    return record ? this.toEntity(record) : undefined;
  }

  async update(
    id: number,
    changes: Partial<FinancialRecordEntity>,
  ): Promise<FinancialRecordEntity | undefined> {
    const [updated] = await this.databaseService.client
      .update(financialRecordsTable)
      .set({
        ...(changes.amount !== undefined
          ? { amount: changes.amount.toFixed(2) }
          : {}),
        ...(changes.type !== undefined ? { type: changes.type } : {}),
        ...(changes.category !== undefined
          ? { category: changes.category }
          : {}),
        ...(changes.date !== undefined ? { date: changes.date } : {}),
        ...(changes.notes !== undefined ? { notes: changes.notes } : {}),
        updatedAt: new Date(),
      })
      .where(eq(financialRecordsTable.id, id))
      .returning();

    return updated ? this.toEntity(updated) : undefined;
  }

  async remove(id: number): Promise<boolean> {
    const deleted = await this.databaseService.client
      .delete(financialRecordsTable)
      .where(eq(financialRecordsTable.id, id))
      .returning({ id: financialRecordsTable.id });

    return deleted.length > 0;
  }

  private toEntity(
    record: typeof financialRecordsTable.$inferSelect,
  ): FinancialRecordEntity {
    return {
      id: record.id,
      amount: Number(record.amount),
      type: record.type as RecordType,
      category: record.category,
      date: record.date,
      notes: record.notes ?? undefined,
      createdBy: record.createdBy,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
