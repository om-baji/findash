import { Role } from '../common/role.enum';

export interface RequestUser {
  id: number;
  role: Role;
  tokenVersion: number;
}
