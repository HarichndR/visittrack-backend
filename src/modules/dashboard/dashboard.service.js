const Visitor = require('../visitor/visitor.model');
const Exhibitor = require('../exhibitor/exhibitor.model');
const Event = require('../event/event.model');
const Lead = require('../lead/lead.model');
const User = require('../user/user.model');
const OrganizerRequest = require('../user/organizer-request.model');
const mongoose = require('mongoose');

const getDashboardStats = async (eventId = null, user = null) => {
    // If ADMIN, return organizer management stats
    if (user && user.role === 'ADMIN') {
        const totalOrganizers = await User.countDocuments({ role: 'ORGANIZER' });
        const pendingRequests = await OrganizerRequest.countDocuments({ status: 'PENDING' });
        const activeEvents = await Event.countDocuments({ isActive: true });
        
        // Distribution of requests for Pie Chart
        const requestDistribution = await OrganizerRequest.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Platform growth trend (Events created in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const eventTrend = await Event.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
        
        return {
            summary: {
                totalOrganizers: totalOrganizers || 0,
                pendingRequests: pendingRequests || 0,
                activeEvents: activeEvents || 0,
                platformHealth: 'Optimal'
            },
            requestDistribution: requestDistribution.length > 0 
                ? requestDistribution 
                : [{ _id: 'PENDING', count: 0 }, { _id: 'APPROVED', count: 0 }],
            trends: eventTrend.length > 0 ? eventTrend : [],
            role: 'ADMIN'
        };
    }

    // If VISITOR, return their booking stats
    if (user && user.role === 'VISITOR') {
        const bookings = await Visitor.find({ email: user.email }).populate('eventId').lean();
        const savedEventsCount = user.savedEvents?.length || 0;
        
        return {
            summary: {
                totalBookings: bookings.length,
                savedEventsCount,
                latestBooking: bookings[0] || null
            },
            role: 'VISITOR'
        };
    }

    // If EXHIBITOR, return lead intelligence stats
    if (user && user.role === 'EXHIBITOR') {
        const exhibitor = await Exhibitor.findOne({ userId: user._id });
        if (!exhibitor) {
            return { summary: { totalLeads: 0, hotLeads: 0 }, role: 'EXHIBITOR', trends: [] };
        }

        const totalLeads = await Lead.countDocuments({ exhibitorId: exhibitor._id });
        const hotLeads = await Lead.countDocuments({ exhibitorId: exhibitor._id, status: 'HOT' });
        const avgRating = await Lead.aggregate([
            { $match: { exhibitorId: exhibitor._id } },
            { $group: { _id: null, avg: { $avg: "$rating" } } }
        ]);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const leadTrend = await Lead.aggregate([
            { 
                $match: { 
                    exhibitorId: exhibitor._id,
                    createdAt: { $gte: sevenDaysAgo } 
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        return {
            summary: {
                totalLeads,
                hotLeads,
                averageRating: avgRating[0]?.avg?.toFixed(1) || 0,
                leadHealth: totalLeads > 10 ? 'Robust' : 'Developing'
            },
            trends: leadTrend,
            role: 'EXHIBITOR'
        };
    }

    const matchFilter = eventId ? { eventId: new mongoose.Types.ObjectId(eventId) } : {};

    // Standard Organizer/Staff stats
    const summaryStats = await Visitor.aggregate([
        { $match: matchFilter },
        {
            $group: {
                _id: null,
                totalVisitors: { $sum: 1 },
                checkedInVisitors: {
                    $sum: { $cond: [{ $eq: ["$status", "CHECKED_IN"] }, 1, 0] }
                },
                pendingClearance: {
                    $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] }
                },
                confirmedBookings: {
                    $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] }
                }
            }
        }
    ]);

    // Ticket Type Distribution for Pie Chart
    const ticketDistribution = await Visitor.aggregate([
        { $match: matchFilter },
        {
            $group: {
                _id: "$ticketType",
                count: { $sum: 1 }
            }
        }
    ]);

    // Check-in Efficiency for Bar Chart
    const checkInStats = summaryStats[0] || { totalVisitors: 0, checkedInVisitors: 0, pendingClearance: 0, confirmedBookings: 0 };
    const efficiencyComparison = [
        { name: 'Total Registered', value: checkInStats.totalVisitors },
        { name: 'Checked In', value: checkInStats.checkedInVisitors }
    ];

    const Organization = require('../organization/organization.model');
    const org = await Organization.findOne({ owner: user._id });
    const chapterMembers = org?.followers?.length || 0;

    const activeExhibitorsCount = await Exhibitor.countDocuments({ ...matchFilter, status: 'ACTIVE' }).lean();

    // Revenue Calculation
    let totalRevenue = 0;
    if (eventId) {
        const event = await Event.findById(eventId).lean();
        if (event) {
            totalRevenue = (summary.totalVisitors || 0) * (event.price || 0);
        }
    } else {
        // Global count across all events for this organizer
        const events = await Event.find({ organizer: user._id }).lean();
        for (const ev of events) {
            const visitorCount = await Visitor.countDocuments({ eventId: ev._id, status: { $ne: 'PENDING' } });
            totalRevenue += visitorCount * (ev.price || 0);
        }
    }

    const summary = summaryStats[0] || { totalVisitors: 0, checkedInVisitors: 0, pendingClearance: 0, confirmedBookings: 0 };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const visitorTrend = await Visitor.aggregate([
        { 
            $match: { 
                ...matchFilter, 
                createdAt: { $gte: sevenDaysAgo } 
            } 
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    return {
        summary: {
            totalVisitors: summary.totalVisitors,
            activeExhibitors: activeExhibitorsCount,
            checkedInVisitors: summary.checkedInVisitors,
            pendingClearance: summary.pendingClearance,
            confirmedBookings: summary.confirmedBookings,
            chapterMembers: chapterMembers,
            totalRevenue: totalRevenue || 0,
            occupancyRate: summary.totalVisitors > 0 
                ? (summary.checkedInVisitors / summary.totalVisitors) * 100 
                : 0
        },
        trends: visitorTrend,
        ticketDistribution: ticketDistribution.map(item => ({ name: item._id || 'Standard', value: item.count })),
        efficiency: efficiencyComparison,
        role: 'ORGANIZER'
    };
};

const globalSearch = async (query, type) => {
    const filter = { name: { $regex: query, $options: 'i' } };
    const limit = 10;

    if (type === 'EVENT') {
        return await Event.find(filter).select('name location date').limit(limit).lean();
    }
    
    if (type === 'EXHIBITOR') {
        return await Exhibitor.find(filter).select('name contactPerson email').limit(limit).lean();
    }

    return [];
};

module.exports = {
    getDashboardStats,
    globalSearch,
};
