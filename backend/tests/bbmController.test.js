import request from 'supertest';
import { jest } from '@jest/globals';

// Mock pg module BEFORE importing the app
const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
jest.unstable_mockModule('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({ query: mockQuery })),
  default: { Pool: jest.fn().mockImplementation(() => ({ query: mockQuery })) }
}));

const { app } = await import('../index.js');
mockQuery.mockClear(); // Reset hitungan panggilan dari initDb()

afterEach(() => {
  jest.clearAllMocks();
});

describe('BBM Controller Tests', () => {
  describe('GET /api/data-awal', () => {
    it('should return initial data for bensin and motor', async () => {
      const mockBensin = [{ id: 1, nama_bbm: 'Pertamax', harga: 13200 }];
      const mockMotor = [{ id: 1, merek: 'Honda Beat', kapasitas: 4.2 }];

      mockQuery
        .mockResolvedValueOnce({ rows: mockBensin })
        .mockResolvedValueOnce({ rows: mockMotor });

      const response = await request(app).get('/api/data-awal');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bensin');
      expect(response.body).toHaveProperty('motor');
      expect(response.body.bensin).toEqual(mockBensin);
      expect(response.body.motor).toEqual(mockMotor);
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database Error'));

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

    // --- Validation tests (P2.5) ---

    it('should reject negative inputUser', async () => {
      const res = await request(app).post('/api/hitung').send({
        inputUser: -1000, tipeInput: 'uang', kapasitasTangki: 4.2, hargaBbm: 10000
      });
      expect(res.status).toBe(400);
    });

    it('should reject invalid tipeInput', async () => {
      const res = await request(app).post('/api/hitung').send({
        inputUser: 1000, tipeInput: 'dollar', kapasitasTangki: 4.2, hargaBbm: 10000
      });
      expect(res.status).toBe(400);
    });

    it('should reject kapasitasTangki nol', async () => {
      const res = await request(app).post('/api/hitung').send({
        inputUser: 1000, tipeInput: 'uang', kapasitasTangki: 0, hargaBbm: 10000
      });
      expect(res.status).toBe(400);
    });

    it('should reject hargaBbm negatif', async () => {
      const res = await request(app).post('/api/hitung').send({
        inputUser: 1000, tipeInput: 'uang', kapasitasTangki: 4.2, hargaBbm: -5000
      });
      expect(res.status).toBe(400);
    });

    it('should reject missing fields', async () => {
      const res = await request(app).post('/api/hitung').send({
        inputUser: 1000
      });
      expect(res.status).toBe(400);
    });
  });
});
