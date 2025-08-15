import { fetchToolVaultIndex, refreshToolVaultIndex } from '../toolVaultService';
import { NetworkError, ValidationError, NotFoundError } from '../errors';
import { mockToolVaultIndex, mockNetworkResponses } from '../../test-utils/mockData';
import * as validators from '../../utils/validators';

// Mock the validators module
jest.mock('../../utils/validators');
const mockParseToolVaultIndex = validators.parseToolVaultIndex as jest.MockedFunction<typeof validators.parseToolVaultIndex>;

// Mock async-retry
jest.mock('async-retry', () => {
  return jest.fn().mockImplementation((fn) => fn());
});

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('toolVaultService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParseToolVaultIndex.mockReturnValue(mockToolVaultIndex);
  });

  describe('fetchToolVaultIndex', () => {
    it('should fetch index.json successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ...mockNetworkResponses.successResponse,
        json: jest.fn().mockResolvedValue(mockToolVaultIndex),
      });

      const result = await fetchToolVaultIndex();

      expect(mockFetch).toHaveBeenCalledWith('/data/index.json', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(mockParseToolVaultIndex).toHaveBeenCalledWith(mockToolVaultIndex);
      expect(result).toEqual(mockToolVaultIndex);
    });

    it('should use custom API base URL from environment', async () => {
      const originalEnv = import.meta.env.VITE_API_BASE_URL;
      // Mock environment variable
      Object.defineProperty(import.meta, 'env', {
        value: { VITE_API_BASE_URL: 'https://api.example.com' },
        configurable: true,
      });

      mockFetch.mockResolvedValueOnce({
        ...mockNetworkResponses.successResponse,
        json: jest.fn().mockResolvedValue(mockToolVaultIndex),
      });

      await fetchToolVaultIndex();

      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/index.json', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Restore original environment
      Object.defineProperty(import.meta, 'env', {
        value: { VITE_API_BASE_URL: originalEnv },
        configurable: true,
      });
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ...mockNetworkResponses.errorResponse,
        ok: false,
        status: 500,
      });

      await expect(fetchToolVaultIndex()).rejects.toThrow(NetworkError);
      await expect(fetchToolVaultIndex()).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('should handle 404 errors as NotFoundError', async () => {
      mockFetch.mockResolvedValueOnce({
        ...mockNetworkResponses.notFoundResponse,
        ok: false,
        status: 404,
      });

      await expect(fetchToolVaultIndex()).rejects.toThrow(NotFoundError);
      await expect(fetchToolVaultIndex()).rejects.toThrow('Tool data not found');
    });

    it('should not retry client errors (4xx except 404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn(),
      });

      await expect(fetchToolVaultIndex()).rejects.toThrow(NetworkError);
      await expect(fetchToolVaultIndex()).rejects.toThrow('Client error: Forbidden');
    });

    it('should handle validation errors from parseToolVaultIndex', async () => {
      const invalidData = { invalid: 'data' };
      mockFetch.mockResolvedValueOnce({
        ...mockNetworkResponses.successResponse,
        json: jest.fn().mockResolvedValue(invalidData),
      });
      mockParseToolVaultIndex.mockImplementation(() => {
        throw new Error('Invalid ToolVault index data: missing required fields');
      });

      await expect(fetchToolVaultIndex()).rejects.toThrow(ValidationError);
      await expect(fetchToolVaultIndex()).rejects.toThrow('Invalid tool data format');
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
      });

      await expect(fetchToolVaultIndex()).rejects.toThrow(ValidationError);
      await expect(fetchToolVaultIndex()).rejects.toThrow('Invalid JSON format in tool data');
    });

    it('should handle fetch failures', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(fetchToolVaultIndex()).rejects.toThrow(NetworkError);
      await expect(fetchToolVaultIndex()).rejects.toThrow('Failed to fetch tool data');
    });

    it('should validate data against schema', async () => {
      const testData = { test: 'data' };
      mockFetch.mockResolvedValueOnce({
        ...mockNetworkResponses.successResponse,
        json: jest.fn().mockResolvedValue(testData),
      });

      await fetchToolVaultIndex();

      expect(mockParseToolVaultIndex).toHaveBeenCalledWith(testData);
    });
  });

  describe('refreshToolVaultIndex', () => {
    it('should force a fresh fetch with cache busting', async () => {
      const mockTimestamp = 1642780800000;
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

      mockFetch.mockResolvedValueOnce({
        ...mockNetworkResponses.successResponse,
        json: jest.fn().mockResolvedValue(mockToolVaultIndex),
      });

      const result = await refreshToolVaultIndex();

      expect(mockFetch).toHaveBeenCalledWith(`/data/index.json?t=${mockTimestamp}`, {
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockToolVaultIndex);
    });

    it('should handle errors during refresh', async () => {
      mockFetch.mockResolvedValueOnce({
        ...mockNetworkResponses.errorResponse,
        ok: false,
        status: 500,
      });

      await expect(refreshToolVaultIndex()).rejects.toThrow(NetworkError);
    });
  });

  describe('retry logic', () => {
    it('should retry server errors (5xx)', async () => {
      // First call fails with server error, second succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: jest.fn(),
        })
        .mockResolvedValueOnce({
          ...mockNetworkResponses.successResponse,
          json: jest.fn().mockResolvedValue(mockToolVaultIndex),
        });

      // Mock retry to actually execute retries
      const retry = require('async-retry');
      retry.mockImplementation(async (fn, options) => {
        try {
          return await fn();
        } catch (error) {
          // Simulate one retry
          return await fn();
        }
      });

      const result = await fetchToolVaultIndex();
      expect(result).toEqual(mockToolVaultIndex);
    });

    it('should not retry client errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn(),
      });

      await expect(fetchToolVaultIndex()).rejects.toThrow(NetworkError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling edge cases', () => {
    it('should handle undefined response', async () => {
      mockFetch.mockResolvedValueOnce(undefined as any);

      await expect(fetchToolVaultIndex()).rejects.toThrow();
    });

    it('should handle null response data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(null),
      });

      await fetchToolVaultIndex();

      expect(mockParseToolVaultIndex).toHaveBeenCalledWith(null);
    });

    it('should handle empty response data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      });

      await fetchToolVaultIndex();

      expect(mockParseToolVaultIndex).toHaveBeenCalledWith({});
    });
  });
});