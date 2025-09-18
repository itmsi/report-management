const DashboardRepository = require('./postgre_repository');
const { 
  parseStandardQuery, 
  sendQuerySuccess, 
  sendQueryError 
} = require('../../utils');

class DashboardHandler {
  /**
   * POST /dashboard - Get dashboard data
   * Menampilkan data dari tabel categories dan powerBis dengan filter
   */
  async getDashboardData(req, res) {
    try {
      // Parse query parameters dari body request
      const queryParams = parseStandardQuery(req, {
        allowedColumns: ['category_name', 'title', 'status', 'created_at', 'updated_at'],
        defaultOrder: ['created_at', 'desc'],
        searchableColumns: ['categories.name', 'powerBis.title', 'powerBis.description'],
        allowedFilters: ['category_id', 'category_name', 'title', 'status'],
        fromBody: true // Mengambil parameter dari body, bukan query string
      });


      // Validasi query parameters
      if (queryParams.pagination.limit > 100) {
        return sendQueryError(res, 'Limit tidak boleh lebih dari 100', 400);
      }

      // Validasi filter status jika ada
      if (queryParams.filters.status && !['active', 'inactive', 'draft'].includes(queryParams.filters.status)) {
        return sendQueryError(res, 'Status harus active, inactive, atau draft', 400);
      }

      // Get data dengan filter dan pagination
      const result = await DashboardRepository.findWithFilters(queryParams);

      // Send success response
      return sendQuerySuccess(res, result, 'Dashboard data retrieved successfully');

    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return sendQueryError(res, 'Failed to get dashboard data', 500);
    }
  }

  /**
   * GET /dashboard/stats - Get dashboard statistics
   */
  async getDashboardStats(req, res) {
    try {
      const stats = await DashboardRepository.getDashboardStats();

      res.json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error getting dashboard statistics:', error);
      return sendQueryError(res, 'Failed to get dashboard statistics', 500);
    }
  }

  /**
   * GET /dashboard/activities - Get recent dashboard activities
   */
  async getRecentActivities(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      // Validasi limit
      const parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
        return sendQueryError(res, 'Limit harus berupa angka antara 1-50', 400);
      }

      const activities = await DashboardRepository.getRecentActivities(parsedLimit);

      res.json({
        success: true,
        message: 'Recent activities retrieved successfully',
        data: activities
      });
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return sendQueryError(res, 'Failed to get recent activities', 500);
    }
  }

  /**
   * POST /dashboard/stats - Get dashboard statistics (POST method)
   */
  async getDashboardStatsPost(req, res) {
    try {
      const stats = await DashboardRepository.getDashboardStats();

      res.json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error getting dashboard statistics via POST:', error);
      return sendQueryError(res, 'Failed to get dashboard statistics', 500);
    }
  }

  /**
   * POST /dashboard/activities - Get recent activities (POST method)
   */
  async getRecentActivitiesPost(req, res) {
    try {
      const { limit = 10 } = req.body;
      
      // Validasi limit
      const parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
        return sendQueryError(res, 'Limit harus berupa angka antara 1-50', 400);
      }

      const activities = await DashboardRepository.getRecentActivities(parsedLimit);

      res.json({
        success: true,
        message: 'Recent activities retrieved successfully',
        data: activities
      });
    } catch (error) {
      console.error('Error getting recent activities via POST:', error);
      return sendQueryError(res, 'Failed to get recent activities', 500);
    }
  }
}

module.exports = new DashboardHandler();
