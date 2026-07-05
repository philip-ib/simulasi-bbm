import request from 'supertest';
import { app, pool } from '../index.js';
import { jest } from '@jest/globals';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await pool.end();
});

describe('BBM Controller Tests', () => {
  describe('GET /api/data-awal', () => {
    it('should return initial data for bensin and motor', async () => {
      const mockBensin = [{ id: 1, nama_bbm: 'Pertamax', harga: 13200 }];
      const mockMotor = [{ id: 1, merek: 'Honda Beat', kapasitas: 4.2 }];
      
      const poolQuerySpy = jest.spyOn(pool, 'query').mockImplementation((queryText) => {
        if (queryText.includes('bensin')) return Promise.resolve({ rows: mockBensin });
        if (queryText.includes('motor')) return Promise.resolve({ rows: mockMotor });
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app).get('/api/data-awal');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bensin');
      expect(response.body).toHaveProperty('motor');
      expect(response.body.bensin).toEqual(mockBensin);
      expect(response.body.motor).toEqual(mockMotor);
      expect(poolQuerySpy).toHaveBeenCalledTimes(2);
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(pool, 'query').mockRejectedValue(new Error('Database Error'));

      const response = await request(app).get('/api/data-awal');
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database Error');
    });
  });

  describe('POST /api/hitung', () => {
    it('should calculate simulation correctly for tipeInput: uang', async () => {
      const payload = {
        inputUser: 30000,
        tipeInput: 'uang',
        kapasitasTangki: 4.2,
        hargaBbm: 10000
      };

      const response = await request(app).post('/api/hitung').send(payload);

      expect(response.status).toBe(200);
      expect(response.body.literDidapat).toBe(3);
      expect(response.body.totalBiaya).toBe(30000);
      expect(response.body.persentaseTangki).toBeCloseTo(71.4, 1);
      expect(response.body.status).toBe('Aman');
    });

    it('should warn if tangki meluber', async () => {
      const payload = {
        inputUser: 100000,
        tipeInput: 'uang',
        kapasitasTangki: 4.2,
        hargaBbm: 10000
      };

      const response = await request(app).post('/api/hitung').send(payload);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('Meluber! Tangki tidak muat.');
    });
  });
});
