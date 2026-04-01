import { Injectable, OnModuleInit } from '@nestjs/common';
import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly db: NeonHttpDatabase<typeof schema>;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required');
    }

    const client = neon(databaseUrl);
    this.db = drizzle(client, { schema });
  }

  get client(): NeonHttpDatabase<typeof schema> {
    return this.db;
  }

  async onModuleInit(): Promise<void> {
    await this.ensureSchema();
    await this.ensureAdminSeed();
  }

  private async ensureSchema(): Promise<void> {
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(32) NOT NULL,
        status VARCHAR(32) NOT NULL,
        token_version INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `);

    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS financial_records (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        amount NUMERIC(12,2) NOT NULL,
        type VARCHAR(32) NOT NULL,
        category VARCHAR(64) NOT NULL,
        date VARCHAR(10) NOT NULL,
        notes VARCHAR(500),
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `);
  }

  private async ensureAdminSeed(): Promise<void> {
    await this.db.execute(sql`
      INSERT INTO users (name, email, role, status, token_version, created_at, updated_at)
      VALUES (
        'System Admin',
        'admin@finance.local',
        'admin',
        'active',
        0,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `);
  }
}
