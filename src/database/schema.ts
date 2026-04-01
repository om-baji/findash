import {
  integer,
  numeric,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: varchar({ length: 32 }).notNull(),
  status: varchar({ length: 32 }).notNull(),
  tokenVersion: integer('token_version').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const financialRecordsTable = pgTable('financial_records', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  amount: numeric({ precision: 12, scale: 2 }).notNull(),
  type: varchar({ length: 32 }).notNull(),
  category: varchar({ length: 64 }).notNull(),
  date: varchar({ length: 10 }).notNull(),
  notes: varchar({ length: 500 }),
  createdBy: integer('created_by')
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});
