import { RecordType } from '../common/record-type.enum';
import { RecordsRepository } from '../records/records.repository';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let repository: jest.Mocked<RecordsRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<RecordsRepository>;

    service = new DashboardService(repository);
  });

  it('returns totals and net balance', async () => {
    repository.findAll.mockResolvedValue([
      {
        id: 1,
        amount: 2000,
        type: RecordType.Income,
        category: 'Salary',
        date: '2026-03-01',
        createdBy: 1,
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
      {
        id: 2,
        amount: 500,
        type: RecordType.Expense,
        category: 'Rent',
        date: '2026-03-02',
        createdBy: 1,
        createdAt: '2026-03-02T00:00:00.000Z',
        updatedAt: '2026-03-02T00:00:00.000Z',
      },
    ]);

    const result = await service.getSummary();

    expect(result.totalIncome).toBe(2000);
    expect(result.totalExpenses).toBe(500);
    expect(result.netBalance).toBe(1500);
  });
});
