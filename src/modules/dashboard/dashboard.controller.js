const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const dashboardService = require('./dashboard.service');

const getStats = asyncHandler(async (req, res) => {
    const { eventId } = req.query;
    const stats = await dashboardService.getDashboardStats(eventId, req.user);
    res.send(new ApiResponse(200, stats, 'Dashboard stats retrieved successfully'));
});

const search = asyncHandler(async (req, res) => {
    const { query, type } = req.query;
    const results = await dashboardService.globalSearch(query, type);
    res.send(new ApiResponse(200, results, 'Search results retrieved successfully'));
});

module.exports = {
    getStats,
    search,
};
