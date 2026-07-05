import request from 'supertest';
import { app, pool } from '../index.js';
import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await pool.end();
});

describe('Auth Controller Tests', () => {
  describe('POST /api/login', () => {
    it('should login successfully with correct credentials', async () => {
      const mockUser = { id: 1, username: 'admin', password: 'hashedpassword' };
      
      jest.spyOn(pool, 'query').mockResolvedValue({ rows: [mockUser] });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: '123456' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login Berhasil!');
      
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=.*\./); // JWT format matching
      expect(cookies[0]).toMatch(/HttpOnly/);
    });

    it('should fail with wrong username', async () => {
      jest.spyOn(pool, 'query').mockResolvedValue({ rows: [] }); // User not found

      const response = await request(app)
        .post('/api/login')
        .send({ username: 'wrong', password: '123456' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username atau Password salah!');
    });

    it('should fail with wrong password', async () => {
      const mockUser = { id: 1, username: 'admin', password: 'hashedpassword' };
      jest.spyOn(pool, 'query').mockResolvedValue({ rows: [mockUser] });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'wrongpassword' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username atau Password salah!');
    });
  });

  describe('POST /api/logout', () => {
    it('should clear the token cookie on logout', async () => {
      const response = await request(app).post('/api/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout Berhasil!');
      
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=;/); // Cleared cookie string
    });
  });
});
