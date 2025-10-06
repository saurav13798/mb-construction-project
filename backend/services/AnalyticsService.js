const Visit = require('../models/Visit');

class AnalyticsService {
  constructor(visitRepository = null) {
    this.visitRepository = visitRepository || Visit;
  }

  /**
   * Get comprehensive analytics data
   */
  async getAnalyticsData(dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      const filter = {};

      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate);
        if (endDate) filter.timestamp.$lte = new Date(endDate);
      }

      const [
        totalVisits,
        uniqueVisitors,
        pageViews,
        topPages,
        trafficSources,
        deviceBreakdown,
        locationData,
        timeSeriesData
      ] = await Promise.all([
        this.getTotalVisits(filter),
        this.getUniqueVisitors(filter),
        this.getPageViews(filter),
        this.getTopPages(filter),
        this.getTrafficSources(filter),
        this.getDeviceBreakdown(filter),
        this.getLocationData(filter),
        this.getTimeSeriesData(filter)
      ]);

      return {
        overview: {
          totalVisits,
          uniqueVisitors,
          pageViews,
          bounceRate: await this.getBounceRate(filter),
          avgSessionDuration: await this.getAverageSessionDuration(filter)
        },
        traffic: {
          sources: trafficSources,
          devices: deviceBreakdown,
          locations: locationData
        },
        content: {
          topPages,
          exitPages: await this.getExitPages(filter)
        },
        trends: {
          timeSeries: timeSeriesData,
          growth: await this.getGrowthMetrics(filter)
        }
      };
    } catch (error) {
      console.error('❌ AnalyticsService.getAnalyticsData error:', error);
      throw error;
    }
  }

  /**
   * Track page visit
   */
  async trackVisit(visitData) {
    try {
      const visit = new this.visitRepository({
        ...visitData,
        timestamp: new Date()
      });

      await visit.save();
      return visit;
    } catch (error) {
      console.error('❌ AnalyticsService.trackVisit error:', error);
      throw error;
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics() {
    try {
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);

      const [
        activeVisitors,
        recentPages,
        liveTraffic
      ] = await Promise.all([
        this.getActiveVisitors(),
        this.getRecentPageViews(last24Hours),
        this.getLiveTrafficData(last24Hours)
      ]);

      return {
        activeVisitors,
        recentPages,
        liveTraffic,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ AnalyticsService.getRealTimeAnalytics error:', error);
      throw error;
    }
  }

  // Private helper methods

  async getTotalVisits(filter) {
    return this.visitRepository.countDocuments(filter);
  }

  async getUniqueVisitors(filter) {
    const result = await this.visitRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$ipAddress',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          uniqueVisitors: { $sum: 1 }
        }
      }
    ]);

    return result[0]?.uniqueVisitors || 0;
  }

  async getPageViews(filter) {
    return this.visitRepository.countDocuments({
      ...filter,
      page: { $exists: true }
    });
  }

  async getTopPages(filter, limit = 10) {
    return this.visitRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$page',
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' }
        }
      },
      {
        $project: {
          page: '$_id',
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: limit }
    ]);
  }

  async getTrafficSources(filter) {
    return this.visitRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$referrer',
          visits: { $sum: 1 }
        }
      },
      {
        $project: {
          source: {
            $cond: {
              if: { $eq: ['$_id', null] },
              then: 'Direct',
              else: '$_id'
            }
          },
          visits: 1
        }
      },
      { $sort: { visits: -1 } }
    ]);
  }

  async getDeviceBreakdown(filter) {
    return this.visitRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$deviceType',
          visits: { $sum: 1 }
        }
      },
      {
        $project: {
          device: '$_id',
          visits: 1
        }
      },
      { $sort: { visits: -1 } }
    ]);
  }

  async getLocationData(filter) {
    return this.visitRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$country',
          visits: { $sum: 1 }
        }
      },
      {
        $project: {
          country: '$_id',
          visits: 1
        }
      },
      { $sort: { visits: -1 } },
      { $limit: 10 }
    ]);
  }

  async getTimeSeriesData(filter) {
    const groupBy = this.determineTimeGrouping(filter);

    return this.visitRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: groupBy,
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' }
        }
      },
      {
        $project: {
          date: '$_id',
          visits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { date: 1 } }
    ]);
  }

  async getBounceRate(filter) {
    // Simplified bounce rate calculation
    // In real implementation, you'd track session data more comprehensively
    const totalSessions = await this.visitRepository.countDocuments(filter);
    const singlePageSessions = await this.visitRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$sessionId',
          pageCount: { $sum: 1 }
        }
      },
      {
        $match: { pageCount: 1 }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);

    const bounces = singlePageSessions[0]?.count || 0;
    return totalSessions > 0 ? Math.round((bounces / totalSessions) * 100) : 0;
  }

  async getAverageSessionDuration(filter) {
    // Placeholder implementation
    // In real implementation, you'd calculate based on session start/end times
    return 180; // 3 minutes average
  }

  async getExitPages(filter, limit = 10) {
    // Simplified exit pages calculation
    return this.visitRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$page',
          exits: { $sum: 1 }
        }
      },
      {
        $project: {
          page: '$_id',
          exits: 1
        }
      },
      { $sort: { exits: -1 } },
      { $limit: limit }
    ]);
  }

  async getGrowthMetrics(filter) {
    // Calculate growth compared to previous period
    const currentPeriod = await this.getTotalVisits(filter);
    
    // Calculate previous period (simplified)
    const previousFilter = { ...filter };
    if (filter.timestamp) {
      const start = new Date(filter.timestamp.$gte);
      const end = new Date(filter.timestamp.$lte);
      const duration = end - start;
      
      previousFilter.timestamp = {
        $gte: new Date(start - duration),
        $lte: start
      };
    }

    const previousPeriod = await this.getTotalVisits(previousFilter);
    
    const growth = previousPeriod > 0 
      ? Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100)
      : 0;

    return {
      current: currentPeriod,
      previous: previousPeriod,
      growth,
      trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
    };
  }

  async getActiveVisitors() {
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    return this.visitRepository.countDocuments({
      timestamp: { $gte: fiveMinutesAgo }
    });
  }

  async getRecentPageViews(since) {
    return this.visitRepository.find({
      timestamp: { $gte: since }
    })
    .sort({ timestamp: -1 })
    .limit(50)
    .select('page timestamp ipAddress userAgent');
  }

  async getLiveTrafficData(since) {
    return this.visitRepository.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            hour: { $hour: '$timestamp' }
          },
          visits: { $sum: 1 }
        }
      },
      { $sort: { '_id.hour': 1 } }
    ]);
  }

  determineTimeGrouping(filter) {
    // Determine appropriate time grouping based on date range
    if (filter.timestamp) {
      const start = new Date(filter.timestamp.$gte);
      const end = new Date(filter.timestamp.$lte);
      const duration = end - start;
      const days = duration / (1000 * 60 * 60 * 24);

      if (days <= 1) {
        // Group by hour for single day
        return {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' }
        };
      } else if (days <= 31) {
        // Group by day for month or less
        return {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        };
      } else {
        // Group by month for longer periods
        return {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' }
        };
      }
    }

    // Default to daily grouping
    return {
      year: { $year: '$timestamp' },
      month: { $month: '$timestamp' },
      day: { $dayOfMonth: '$timestamp' }
    };
  }
}

module.exports = AnalyticsService;