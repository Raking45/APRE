/**
 * Author: Professor Krasso
 * Date: 10 September 2024
 * File: index.spec.js
 * Description: Test the sales report API
 */

// Require the modules
const request = require('supertest');
const app = require('../../../../src/app');
const { mongo } = require('../../../../src/utils/mongo');

jest.mock('../../../../src/utils/mongo');

// Test the sales report API
describe('Apre Sales Report API - Regions', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the sales/regions endpoint
  it('should fetch a list of distinct sales regions', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue(['North', 'South', 'East', 'West'])
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/sales/regions'); // Send a GET request to the sales/regions endpoint

    expect(response.status).toBe(200); // Expect a 200 status code
    expect(response.body).toEqual(['North', 'South', 'East', 'West']); // Expect the response body to match the expected data
  });

  // Test the sales/regions endpoint with no regions found
  it('should return 404 for an invalid endpoint', async () => {
    const response = await request(app).get('/api/reports/sales/invalid-endpoint'); // Send a GET request to an invalid endpoint
    expect(response.status).toBe(404); // Expect a 404 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });

  // Test the sales/regions endpoint with no regions found
  it('should return 200 with an empty array if no regions are found', async () => {
    // Mock the MongoDB implementation
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue([])
      };
      await callback(db);
    });

    // Make a request to the endpoint
    const response = await request(app).get('/api/reports/sales/regions');

    expect(response.status).toBe(200); // Expect a 200 status code
    expect(response.body).toEqual([]); // Expect the response body to match the expected data
  });
});

// Test the sales report API
describe('Apre Sales Report API - Sales by Region', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the sales/regions/:region endpoint
  it('should fetch sales data for a specific region, grouped by salesperson', async () => {
    mongo.mockImplementation(async (callback) => {
      // Mock the MongoDB collection
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              salesperson: 'John Doe',
              totalSales: 1000
            },
            {
              salesperson: 'Jane Smith',
              totalSales: 1500
            }
          ])
        })
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/sales/regions/north'); // Send a GET request to the sales/regions/:region endpoint
    expect(response.status).toBe(200); // Expect a 200 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        salesperson: 'John Doe',
        totalSales: 1000
      },
      {
        salesperson: 'Jane Smith',
        totalSales: 1500
      }
    ]);
  });

  it('should return 200 and an empty array if no sales data is found for the region', async () => {
    // Mock the MongoDB implementation
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      };
      await callback(db);
    });

    // Make a request to the endpoint
    const response = await request(app).get('/api/reports/sales/regions/unknown-region');

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return 404 for an invalid endpoint', async () => {
    // Make a request to an invalid endpoint
    const response = await request(app).get('/api/reports/sales/invalid-endpoint');

    // Assert the response
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });

  // Task M-076: customer-sales endpoint tests
  // Test the sales report API - Customer Sales
  describe('Apre Sales Report API - Customer Sales', () => {
    beforeEach(() => {
    mongo.mockClear();
  });

  // Test successful response with sample data
  it('should return customer sales data grouped by customer and salesperson', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          {
            customer: 'Acme Corp',
            salesperson: 'John Doe',
            totalSales: 2000
          },
          {
            customer: 'Beta LLC',
            salesperson: 'Jane Smith',
            totalSales: 3000
          }
        ])
      })
    };
    await callback(db);
  });

  const response = await request(app).get('/api/reports/sales/customer-sales');

  expect(response.status).toBe(200);
  expect(response.body).toEqual([
    {
      customer: 'Acme Corp',
      salesperson: 'John Doe',
      totalSales: 2000
    },
    {
      customer: 'Beta LLC',
      salesperson: 'Jane Smith',
      totalSales: 3000
    }
    ]);
  });

  // Test successful response with empty data
  it('should return 200 and an empty array when no sales data exists', async () => {
    mongo.mockImplementation(async (callback) => {
    const db = {
      collection: jest.fn().mockReturnThis(),
      aggregate: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
      })
    };
    await callback(db);
  });

    const response = await request(app).get('/api/reports/sales/customer-sales');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Test aggregation pipeline
  it('should call aggregate with the correct pipeline', async () => {
  const mockAggregate = jest.fn().mockReturnValue({
    toArray: jest.fn().mockResolvedValue([])
  });

  const mockCollection = jest.fn(() => ({
    aggregate: mockAggregate
  }));

  mongo.mockImplementation(async (callback) => {
    const db = {
      collection: mockCollection
    };
    await callback(db);
  });

  await request(app).get('/api/reports/sales/customer-sales');

  expect(mockCollection).toHaveBeenCalledWith('sales');
  expect(mockAggregate).toHaveBeenCalledWith([
    {
      $group: {
        _id: {
          customer: '$customer',
          salesperson: '$salesperson'
        },
        totalSales: { $sum: '$amount' }
      }
    },
    {
      $project: {
        _id: 0,
        customer: '$_id.customer',
        salesperson: '$_id.salesperson',
        totalSales: 1
      }
    },
    {
      $sort: {
        customer: 1,
        salesperson: 1
      }
    }
  ]);
});

  });
});