import { RecordType } from './record-type.enum';
import { Role } from './role.enum';
import { UserStatus } from './user-status.enum';

export interface UserEntity {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialRecordEntity {
  id: number;
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}
