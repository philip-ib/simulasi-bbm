import request from 'supertest';
import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';

// Mock pg BEFORE importing app
const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
jest.unstable_mockModule('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({ query: mockQuery })),
  default: { Pool: jest.fn().mockImplementation(() => ({ query: mockQuery })) }
}));

const { app } = await import('../index.js');

afterEach(() => {
  jest.clearAllMocks();
});

describe('Auth Controller Tests', () => {
  describe('POST /api/login', () => {
    it('should login successfully with correct credentials', async () => {
      const mockUser = { id: 1, username: 'admin', password: 'hashedpassword' };

      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });
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
      mockQuery.mockResolvedValueOnce({ rows: [] }); // User not found

      const response = await request(app)
        .post('/api/login')
        .send({ username: 'wrong', password: '123456' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username atau Password salah!');
    });

    it('should fail with wrong password', async () => {
      const mockUser = { id: 1, username: 'admin', password: 'hashedpassword' };
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });
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
