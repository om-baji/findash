import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { UserEntity } from '../common/entities';
import { DatabaseService } from '../database/database.service';
import { usersTable } from '../database/schema';
import { Role } from '../common/role.enum';
import { UserStatus } from '../common/user-status.enum';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(user: Omit<UserEntity, 'id'>): Promise<UserEntity> {
    const [created] = await this.databaseService.client
      .insert(usersTable)
      .values({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        tokenVersion: user.tokenVersion,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      })
      .returning();

    return this.toEntity(created);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.databaseService.client.select().from(usersTable);
    return users.map((user) => this.toEntity(user));
  }

  async findById(id: number): Promise<UserEntity | undefined> {
    const [user] = await this.databaseService.client
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    return user ? this.toEntity(user) : undefined;
  }

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    const [user] = await this.databaseService.client
      .select()
      .from(usersTable)
      .where(sql`lower(${usersTable.email}) = lower(${email})`);

    return user ? this.toEntity(user) : undefined;
  }

  async update(
    id: number,
    changes: Partial<UserEntity>,
  ): Promise<UserEntity | undefined> {
    const [updated] = await this.databaseService.client
      .update(usersTable)
      .set({
        ...(changes.name !== undefined ? { name: changes.name } : {}),
        ...(changes.email !== undefined ? { email: changes.email } : {}),
        ...(changes.role !== undefined ? { role: changes.role } : {}),
        ...(changes.status !== undefined ? { status: changes.status } : {}),
        ...(changes.tokenVersion !== undefined
          ? { tokenVersion: changes.tokenVersion }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))
      .returning();

    return updated ? this.toEntity(updated) : undefined;
  }

  async remove(id: number): Promise<boolean> {
    const deleted = await this.databaseService.client
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });

    return deleted.length > 0;
  }

  async incrementTokenVersion(id: number): Promise<UserEntity | undefined> {
    const [updated] = await this.databaseService.client
      .update(usersTable)
      .set({
        tokenVersion: sql`${usersTable.tokenVersion} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))
      .returning();

    return updated ? this.toEntity(updated) : undefined;
  }

  private toEntity(user: typeof usersTable.$inferSelect): UserEntity {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      status: user.status as UserStatus,
      tokenVersion: user.tokenVersion,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
