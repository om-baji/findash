import { Injectable } from '@nestjs/common';
import { RecordType } from '../common/record-type.enum';
import { RecordsRepository } from '../records/records.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly recordsRepository: RecordsRepository) {}

  async getSummary() {
    const records = await this.recordsRepository.findAll();

    const totalIncome = records
      .filter((record) => record.type === RecordType.Income)
      .reduce((sum, record) => sum + record.amount, 0);

    const totalExpenses = records
      .filter((record) => record.type === RecordType.Expense)
      .reduce((sum, record) => sum + record.amount, 0);

    const categoryTotals = records.reduce<Record<string, number>>(
      (acc, record) => {
        acc[record.category] = (acc[record.category] ?? 0) + record.amount;
        return acc;
      },
      {},
    );

    const recentActivity = [...records]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);

    const monthlyTrends = records.reduce<
      Record<string, { income: number; expense: number }>
    >((acc, record) => {
      const month = record.date.slice(0, 7);
      const current = acc[month] ?? { income: 0, expense: 0 };
      if (record.type === RecordType.Income) {
        current.income += record.amount;
      } else {
        current.expense += record.amount;
      }
      acc[month] = current;
      return acc;
    }, {});

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      categoryTotals,
      recentActivity,
      monthlyTrends,
    };
  }
}
