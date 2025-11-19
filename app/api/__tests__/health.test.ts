// app/api/__tests__/health.test.ts
import handler from '../health';

describe('GET /api/health', () => {
  it('should return 200 with success message', () => {
    const req = { method: 'GET' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'API is running',
        timestamp: expect.any(String),
      })
    );
  });

  it('should return 405 for non-GET requests', () => {
    const req = { method: 'POST' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should return 405 for PUT requests', () => {
    const req = { method: 'PUT' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('should return 405 for DELETE requests', () => {
    const req = { method: 'DELETE' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('should include valid ISO timestamp', () => {
    const req = { method: 'GET' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    handler(req, res);

    const callArgs = res.json.mock.calls[0][0];
    const timestamp = new Date(callArgs.timestamp);
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });

  it('should always return success true for GET', () => {
    const req = { method: 'GET' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    handler(req, res);

    expect(res.json.mock.calls[0][0].success).toBe(true);
  });
});
