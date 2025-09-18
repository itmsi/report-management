const DashboardHandler = require('./handler');

module.exports = {
  getDashboardData: DashboardHandler.getDashboardData.bind(DashboardHandler),
  getDashboardStats: DashboardHandler.getDashboardStats.bind(DashboardHandler),
  getDashboardStatsPost: DashboardHandler.getDashboardStatsPost.bind(DashboardHandler),
  getRecentActivities: DashboardHandler.getRecentActivities.bind(DashboardHandler),
  getRecentActivitiesPost: DashboardHandler.getRecentActivitiesPost.bind(DashboardHandler),
};
