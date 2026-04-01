import { NotFoundException } from '@nestjs/common';
import { RecordType } from '../common/record-type.enum';
import { RecordsRepository } from './records.repository';
import { RecordsService } from './records.service';

describe('RecordsService', () => {
  let service: RecordsService;
  let repository: jest.Mocked<RecordsRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<RecordsRepository>;

    service = new RecordsService(repository);
  });

  it('filters by type and paginates', async () => {
    repository.findAll.mockResolvedValue([
      {
        id: 1,
        amount: 1000,
        type: RecordType.Income,
        category: 'Salary',
        date: '2026-03-01',
        createdBy: 1,
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
      {
        id: 2,
        amount: 50,
        type: RecordType.Expense,
        category: 'Food',
        date: '2026-03-02',
        createdBy: 1,
        createdAt: '2026-03-02T00:00:00.000Z',
        updatedAt: '2026-03-02T00:00:00.000Z',
      },
    ]);

    const result = await service.findAll({
      type: RecordType.Income,
      page: 1,
      limit: 10,
    });

    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it('throws not found when updating unknown record', async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      service.update(100, { category: 'Travel' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
