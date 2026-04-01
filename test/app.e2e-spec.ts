import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { neon } from '@neondatabase/serverless';
import { AppModule } from './../src/app.module';

const hasDatabase = Boolean(process.env.DATABASE_URL);

(hasDatabase ? describe : describe.skip)('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const sql = neon(process.env.DATABASE_URL as string);
    await sql`TRUNCATE TABLE financial_records, users RESTART IDENTITY CASCADE`;
    await sql`
      INSERT INTO users (name, email, role, status, token_version, created_at, updated_at)
      VALUES ('System Admin', 'admin@finance.local', 'admin', 'active', 0, NOW(), NOW())
    `;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /health returns status', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as { status: string };
        expect(body.status).toBe('ok');
      });
  });

  it('enforces role permissions and returns dashboard summary', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .set('x-user-id', '1')
      .send({
        name: 'Nina Analyst',
        email: 'nina@finance.local',
        role: 'analyst',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/users')
      .set('x-user-id', '1')
      .send({
        name: 'Vik Viewer',
        email: 'vik@finance.local',
        role: 'viewer',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/records')
      .set('x-user-id', '1')
      .send({
        amount: 3000,
        type: 'income',
        category: 'Salary',
        date: '2026-03-01',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/records')
      .set('x-user-id', '1')
      .send({
        amount: 800,
        type: 'expense',
        category: 'Rent',
        date: '2026-03-02',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/records')
      .set('x-user-id', '3')
      .expect(403);

    await request(app.getHttpServer())
      .get('/records')
      .set('x-user-id', '2')
      .expect(200)
      .expect((res) => {
        const body = res.body as { data: unknown[] };
        expect(body.data).toHaveLength(2);
      });

    await request(app.getHttpServer())
      .get('/dashboard/summary')
      .set('x-user-id', '3')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          totalIncome: number;
          totalExpenses: number;
          netBalance: number;
        };
        expect(body.totalIncome).toBe(3000);
        expect(body.totalExpenses).toBe(800);
        expect(body.netBalance).toBe(2200);
      });
  });

  it('supports signup endpoint', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'New User',
        email: 'new.user@finance.local',
      })
      .expect(201)
      .expect((res) => {
        const body = res.body as {
          accessToken: string;
          user: { role: string; email: string };
        };
        expect(typeof body.accessToken).toBe('string');
        expect(body.user.role).toBe('viewer');
        expect(body.user.email).toBe('new.user@finance.local');
      });
  });

  it('invalidates old token after logout using token versioning', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@finance.local' })
      .expect(201);

    const body = loginResponse.body as { accessToken: string };
    const firstToken = body.accessToken;

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${firstToken}`)
      .expect(201)
      .expect((res) => {
        const logoutBody = res.body as {
          success: boolean;
          tokenVersion: number;
        };
        expect(logoutBody.success).toBe(true);
        expect(logoutBody.tokenVersion).toBe(1);
      });

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${firstToken}`)
      .expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
