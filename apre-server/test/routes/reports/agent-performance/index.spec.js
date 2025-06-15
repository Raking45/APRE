/**
 * Author: Professor Krasso
 * Date: 10 September 2024
 * File: index.spec.js
 * Description: Test the agent performance API
 */

// Require the modules
const request = require('supertest');
const app = require('../../../../src/app');
const { mongo } = require('../../../../src/utils/mongo');

jest.mock('../../../../src/utils/mongo');

// Test the agent performance API
describe('Apre Agent Performance API', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the call-duration-by-date-range endpoint
  it('should fetch call duration data for agents within a specified date range', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              agents: ['Agent A', 'Agent B'],
              callDurations: [120, 90]
            }
          ])
        })
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/agent-performance/call-duration-by-date-range?startDate=2023-01-01&endDate=2023-01-31'); // Send a GET request to the call-duration-by-date-range endpoint

    expect(response.status).toBe(200); // Expect a 200 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        agents: ['Agent A', 'Agent B'],
        callDurations: [120, 90]
      }
    ]);
  });

  // Test the call-duration-by-date-range endpoint with missing parameters
  it('should return 400 if startDate or endDate is missing', async () => {
    const response = await request(app).get('/api/reports/agent-performance/call-duration-by-date-range?startDate=2023-01-01'); // Send a GET request to the call-duration-by-date-range endpoint with missing endDate
    expect(response.status).toBe(400); // Expect a 400 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Start date and end date are required',
      status: 400,
      type: 'error'
    });
  });

  // Test the call-duration-by-date-range endpoint with an invalid date range
  it('should return 404 for an invalid endpoint', async () => {
    const response = await request(app).get('/api/reports/agent-performance/invalid-endpoint'); // Send a GET request to an invalid endpoint
    expect(response.status).toBe(404); // Expect a 404 status code
    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });

  // Test 1: GET/agent-names should return a sorted list of agents
  it('should fetch and return a sorted list of agents', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { agentId: 1, name: 'Alice' },
            { agentId: 2, name: 'Bob' }
          ])
        })
      };
      await callback(db);
    });
    const response = await request(app).get('/api/reports/agent-performance/agent-names');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      agents: [
        { agentId: 1, name: 'Alice' },
        { agentId: 2, name: 'Bob' }
      ]
    });
  });

  // Test 2: GET /resolution-time-by-month should return resolution data for a valid agent
  it('should return resolution data for a valid agent name', async () => {
    mongo.mockImplementation(async(callback) => {
      const db = {
        collection: jest.fn((name) => {
          if (name === 'agents') {
            return {
              findOne: jest.fn().mockResolvedValue({ name: 'Alice', agentId: 123 })
            };
          }
          if (name === 'agentPerformance') {
            return {
              aggregate: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([
                  {
                    results: [
                      {
                        agent: 'Alice',
                        month: 1,
                        year: 2023,
                        avgResolutionTime: 35.5
                      }
                    ]
                  }
                ])
              })
            };
          }
        })
      };
      await callback(db);
    });
    const response = await request(app).get('/api/reports/agent-performance/resolution-time-by-month?agentName=Alice');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      results: [
        {
          agent: 'Alice',
          month: 1,
          year: 2023,
          avgResolutionTime: 35.5
        }
      ]
    });
  });

  // Test 3: GET /resolution-time-by-month should return 404 if agent is not found
  it('should return 404 if agent is not found', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn(() => ({
          findOne: jest.fn().mockResolvedValue(null)
        }))
      };
      await callback(db);
    });
    const response = await request(app).get('/api/reports/agent-performance/resolution-time-by-month?agentName=NonExistent');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Agent "NonExistent" not found',
      status: 404,
      type: 'error'
    });
  });

});