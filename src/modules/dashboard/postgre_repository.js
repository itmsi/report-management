const knex = require('../../knexfile');
const db = require('knex')(knex[process.env.NODE_ENV || 'development']);
const { 
  buildCountQuery, 
  applyStandardFilters, 
  formatPaginatedResponse 
} = require('../../utils/standard_query');

class DashboardRepository {

  /**
   * Find dashboard data with filters and pagination
   * Menggabungkan data dari tabel powerBis dan categories
   */
  async findWithFilters(queryParams) {
    try {
      // Base query untuk data dengan JOIN ke categories
      const baseQuery = db('powerBis')
        .select([
          'categories.name as category_name',
          'powerBis.title',
          'powerBis.status',
          'powerBis.link',
          'powerBis.file',
          'powerBis.description'
        ])
        .leftJoin('categories', 'powerBis.category_id', 'categories.category_id')
        .where('powerBis.is_delete', false)
        .where('categories.is_delete', false);

      // Apply custom filters dengan explicit table prefix
      let filteredQuery = baseQuery.clone();
      
      if (queryParams.filters.category_id) {
        filteredQuery = filteredQuery.where('powerBis.category_id', queryParams.filters.category_id);
      }

      if (queryParams.filters.category_name) {
        filteredQuery = filteredQuery.where('categories.name', 'ilike', `%${queryParams.filters.category_name}%`);
      }

      if (queryParams.filters.title) {
        filteredQuery = filteredQuery.where('powerBis.title', 'ilike', `%${queryParams.filters.title}%`);
      }

      if (queryParams.filters.status) {
        filteredQuery = filteredQuery.where('powerBis.status', queryParams.filters.status);
      }

      // Apply search dengan explicit table prefix
      if (queryParams.search && queryParams.search.trim() !== '') {
        filteredQuery = filteredQuery.where(function() {
          this.where('categories.name', 'ilike', `%${queryParams.search}%`)
              .orWhere('powerBis.title', 'ilike', `%${queryParams.search}%`)
              .orWhere('powerBis.description', 'ilike', `%${queryParams.search}%`);
        });
      }

      // Query untuk count total records - hanya count tanpa select kolom lain
      const countQuery = db('powerBis')
        .leftJoin('categories', 'powerBis.category_id', 'categories.category_id')
        .where('powerBis.is_delete', false)
        .where('categories.is_delete', false);

      // Apply filters yang sama ke count query
      let countQueryFiltered = countQuery.clone();
      
      if (queryParams.filters.category_id) {
        countQueryFiltered = countQueryFiltered.where('powerBis.category_id', queryParams.filters.category_id);
      }

      if (queryParams.filters.category_name) {
        countQueryFiltered = countQueryFiltered.where('categories.name', 'ilike', `%${queryParams.filters.category_name}%`);
      }

      if (queryParams.filters.title) {
        countQueryFiltered = countQueryFiltered.where('powerBis.title', 'ilike', `%${queryParams.filters.title}%`);
      }

      if (queryParams.filters.status) {
        countQueryFiltered = countQueryFiltered.where('powerBis.status', queryParams.filters.status);
      }

      // Apply search ke count query
      if (queryParams.search && queryParams.search.trim() !== '') {
        countQueryFiltered = countQueryFiltered.where(function() {
          this.where('categories.name', 'ilike', `%${queryParams.search}%`)
              .orWhere('powerBis.title', 'ilike', `%${queryParams.search}%`)
              .orWhere('powerBis.description', 'ilike', `%${queryParams.search}%`);
        });
      }

      const [{ count: total }] = await countQueryFiltered.count('powerBis.powerbi_id as count');

      // Apply sorting dengan explicit table prefix
      let sortColumn = queryParams.sorting.sortBy;
      const sortDirection = queryParams.sorting.sortOrder;

      // Map sort column dengan table prefix
      if (sortColumn === 'category_name') {
        sortColumn = 'categories.name';
      } else if (['title', 'status', 'created_at', 'updated_at'].includes(sortColumn)) {
        sortColumn = `powerBis.${sortColumn}`;
      } else {
        sortColumn = 'powerBis.created_at'; // default
      }

      // Apply sorting dan pagination
      const dataQuery = filteredQuery.clone()
        .orderBy(sortColumn, sortDirection)
        .limit(queryParams.pagination.limit)
        .offset(queryParams.pagination.offset);

      const data = await dataQuery;

      // Format response dengan pagination metadata
      return formatPaginatedResponse(data, queryParams.pagination, parseInt(total));

    } catch (error) {
      console.error('Error in DashboardRepository.findWithFilters:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      // Total categories
      const totalCategories = await db('categories')
        .where('is_delete', false)
        .count('* as count')
        .first();

      // Total PowerBI reports
      const totalReports = await db('powerBis')
        .where('is_delete', false)
        .count('* as count')
        .first();

      // Reports by status
      const reportsByStatus = await db('powerBis')
        .select('status')
        .count('* as count')
        .where('is_delete', false)
        .groupBy('status');

      // Reports by category
      const reportsByCategory = await db('powerBis')
        .select([
          'categories.name as category_name',
          db.raw('COUNT("powerBis"."powerbi_id") as total_reports')
        ])
        .leftJoin('categories', 'powerBis.category_id', 'categories.category_id')
        .where('powerBis.is_delete', false)
        .where('categories.is_delete', false)
        .groupBy('categories.category_id', 'categories.name')
        .orderBy('total_reports', 'desc');

      return {
        totalCategories: parseInt(totalCategories.count),
        totalReports: parseInt(totalReports.count),
        reportsByStatus: reportsByStatus.map(item => ({
          status: item.status,
          count: parseInt(item.count)
        })),
        reportsByCategory: reportsByCategory.map(item => ({
          categoryName: item.category_name,
          totalReports: parseInt(item.total_reports)
        }))
      };

    } catch (error) {
      console.error('Error in DashboardRepository.getDashboardStats:', error);
      throw error;
    }
  }

  /**
   * Get recent dashboard activities
   */
  async getRecentActivities(limit = 10) {
    try {
      const activities = await db('powerBis')
        .select([
          'categories.name as category_name',
          'powerBis.title',
          'powerBis.status',
          'powerBis.created_at',
          'powerBis.updated_at'
        ])
        .leftJoin('categories', 'powerBis.category_id', 'categories.category_id')
        .where('powerBis.is_delete', false)
        .where('categories.is_delete', false)
        .orderBy('powerBis.updated_at', 'desc')
        .limit(limit);

      return activities;

    } catch (error) {
      console.error('Error in DashboardRepository.getRecentActivities:', error);
      throw error;
    }
  }
}

module.exports = new DashboardRepository();
