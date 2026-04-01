import { Role } from '../common/role.enum';

export interface TokenPayload {
  sub: number;
  role: Role;
  tokenVersion: number;
  iat: number;
}
