/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre agent performance API for the agent performance reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

/**
 * @description
 *
 * GET /call-duration-by-date-range
 *
 * Fetches call duration data for agents within a specified date range.
 *
 * Example:
 * fetch('/call-duration-by-date-range?startDate=2023-01-01&endDate=2023-01-31')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/call-duration-by-date-range', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, 'Start date and end date are required'));
    }

    console.log('Fetching call duration report for date range:', startDate, endDate);

    mongo(async db => {
      const data = await db.collection('agentPerformance').aggregate([
        {
          $match: {
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $lookup: {
            from: 'agents',
            localField: 'agentId',
            foreignField: 'agentId',
            as: 'agentDetails'
          }
        },
        {
          $unwind: '$agentDetails'
        },
        {
          $group: {
            _id: '$agentDetails.name',
            totalCallDuration: { $sum: '$callDuration' }
          }
        },
        {
          $project: {
            _id: 0,
            agent: '$_id',
            callDuration: '$totalCallDuration'
          }
        },
        {
          $group: {
            _id: null,
            agents: { $push: '$agent' },
            callDurations: { $push: '$callDuration' }
          }
        },
        {
          $project: {
            _id: 0,
            agents: 1,
            callDurations: 1
          }
        }
      ]).toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error('Error in /call-duration-by-date-range', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /agent-names
 *
 * Fetches a list of all agent names and their agent IDs.
 *
 * Example:
 * fetch('/agent-names')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/agent-names', (req, res, next) => { // Define a GET route at /agent-names
  try {
    console.log('Fetching agent names');  // Log that fetch has been initialized

    mongo(async db => {  // Connect to MongoDB using a helper function 'mongo'
      const data = await db.collection('agents').aggregate([ // Run aggregation on the 'agents' collection'
        {
          $project: {  // Only include specific fields in the result
            _id: 0,  // Exclude MongoDB's default _id field
            agentId: 1,  // Include agentId
            name: 1 // Include name
          }
        },
        {
          $sort: { name: 1 }  // Sort the results alphabetically by name (ascending)
        }
      ]).toArray();
      res.send({ agents: data}); // Convert the aggregation cursor to an array
    }, next);  // Pass the next middleware handler in case of MongoDB errors
  } catch (err) {
    console.error('Error in /agent-names', err);  // Catch and run unexpected runtime error
  }
});

/**
 * @description
 *
 * GET /resolution-time-by-month
 *
 * Fetches average resolution time per agent, grouped by month and year, filtered by agent name.
 *
 * Example:
 * fetch('/resolution-time-by-month?agentName=John Doe')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/resolution-time-by-month', (req, res, next) => { // Define a GET route at /resolution-time-by-month
  try {
    const { agentName } = req.query;  // Extract agentName from query parameters

    if (!agentName) {  // Validate that agentName was provided
      return next(createError(400, 'Agent name is required'));  // Error if agentName is not provided
    }
    console.log('Fetching resolution time for agent', agentName);  // Log the agentName being queried

    mongo(async db => {  // Connect to MongoDB using the helper function 'mongo'
      const agent = await db.collection('agents').findOne({ name: agentName });  // Find the agent document based on the provided name

      if (!agent) {
        return next(createError(404, `Agent "${agentName}" not found`));  // If no agent is found, return a 404 error
      }

      const data = await db.collection('agentPerformance').aggregate([  // Aggregate data from the agentPerformance collection for the matched agent
        {
          $match: {
            agentId: agent.agentId // Filter only records that belong to the specified agent
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },  // Extract the month from the date
            year: { $year: '$date' }  // Extract the year from the date
          },
          avgResolutionTime: { $avg: '$resolutionTime' }  // Calculate average resolution time per month/year
        }
      },
      {
        $project: {
          _id: 0,  // Exclude MongoDBs default Id field
          agent: agent.name,  // Include agent name fetched from 'agents' collection
          month: '$_id.month',  // Include the month from the grouped _id
          year: '$_id.year',  // Include the year from the grouped _id
          avgResolutionTime: 1  // Include the average resolution time
        }
      },
      {
        $sort: { year: 1, month: 1 }  // Sort the results chronologically by year then month
      },
      {
        $group: {
          _id: null,
          results: { $push: '$$ROOT' }  // Push each record into a 'results' array
        }
      },
      {
        $project: {
          _id: 0,
          results: 1  // Final shape: { results: [] }
        }
      }
      ]).toArray()  // Convert aggregation cursor to an array
      res.send(data[0] || { results: [] });  // Send the first (and only) document from the aggregation result, or an empty results array if none
    }, next);  // Provide next for error handling in the mongo wrapper
  } catch (err) {
    console.error('Error in /resolution-time-by-month', err);  // Handle any unexpected errors that occur during execution
    next(err);
  }
});

module.exports = router;