import request from 'supertest';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const SECRET_KEY = process.env.SECRET_KEY;

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

describe('Protected Routes Tests', () => {
  const mockToken = jwt.sign({ id: 1, username: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
  const validCookie = `token=${mockToken}`;

  describe('POST /api/motor', () => {
    it('should deny access if no token is provided', async () => {
      const response = await request(app)
        .post('/api/motor')
        .send({ merek: 'Yamaha', kapasitas: 5 });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/Akses ditolak/);
    });

    it('should deny access if an invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/motor')
        .set('Cookie', ['token=invalid_token_string'])
        .send({ merek: 'Yamaha', kapasitas: 5 });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/Tiket\/Token tidak sah/);
    });

    it('should allow access and add motor if valid token is provided', async () => {
      mockQuery.mockResolvedValue({});

      const response = await request(app)
        .post('/api/motor')
        .set('Cookie', [validCookie])
        .send({ merek: 'Yamaha NMAX', kapasitas: 7.1 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Motor baru berhasil disimpan di PostgreSQL!');
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO motor (merek, kapasitas) VALUES ($1, $2)',
        ['Yamaha NMAX', 7.1]
      );
    });
  });
});
