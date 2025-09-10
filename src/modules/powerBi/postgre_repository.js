const knex = require('../../knexfile');
const db = require('knex')(knex[process.env.NODE_ENV || 'development']);
const { 
  buildCountQuery, 
  applyStandardFilters, 
  formatPaginatedResponse 
} = require('../../utils/standard_query');

class PowerBiRepository {
  async create(data) {
    const [powerBi] = await db('powerBis')
      .insert(data)
      .returning('*');
    return powerBi;
  }

  async findById(id) {
    const powerBi = await db('powerBis')
      .leftJoin('categories', 'powerBis.category_id', 'categories.category_id')
      .where('powerBis.powerbi_id', id)
      .where('powerBis.is_delete', false)
      .select(
        'powerBis.*',
        'categories.name as category_name'
      )
      .first();
    return powerBi;
  }

  async findAll(filters = {}) {
    let query = db('powerBis')
      .leftJoin('categories', 'powerBis.category_id', 'categories.category_id')
      .where('powerBis.is_delete', false)
      .select(
        'powerBis.*',
        'categories.name as category_name'
      );

    // Apply filters
    if (filters.search) {
      query = query.where(function() {
        this.where('powerBis.title', 'ilike', `%${filters.search}%`)
          .orWhere('powerBis.description', 'ilike', `%${filters.search}%`)
          .orWhere('categories.name', 'ilike', `%${filters.search}%`);
      });
    }

    if (filters.category_id) {
      query = query.where('powerBis.category_id', filters.category_id);
    }

    if (filters.status) {
      query = query.where('powerBis.status', filters.status);
    }

    // Apply sorting
    if (filters.sort_by) {
      const sortOrder = filters.sort_order || 'asc';
      query = query.orderBy(`powerBis.${filters.sort_by}`, sortOrder);
    } else {
      query = query.orderBy('powerBis.created_at', 'desc');
    }

    return query;
  }

  async update(id, data) {
    const [powerBi] = await db('powerBis')
      .where('powerbi_id', id)
      .where('is_delete', false)
      .update({
        ...data,
        updated_at: db.fn.now()
      })
      .returning('*');
    return powerBi;
  }

  async softDelete(id, deletedBy) {
    const [powerBi] = await db('powerBis')
      .where('powerbi_id', id)
      .where('is_delete', false)
      .update({
        is_delete: true,
        deleted_at: db.fn.now(),
        deleted_by: deletedBy
      })
      .returning('*');
    return powerBi;
  }

  async restore(id, updatedBy) {
    const [powerBi] = await db('powerBis')
      .where('powerbi_id', id)
      .where('is_delete', true)
      .update({
        is_delete: false,
        deleted_at: null,
        deleted_by: null,
        updated_at: db.fn.now(),
        updated_by: updatedBy
      })
      .returning('*');
    return powerBi;
  }

  async count(filters = {}) {
    let query = db('powerBis')
      .leftJoin('categories', 'powerBis.category_id', 'categories.category_id')
      .where('powerBis.is_delete', false);

    // Apply filters
    if (filters.search) {
      query = query.where(function() {
        this.where('powerBis.title', 'ilike', `%${filters.search}%`)
          .orWhere('powerBis.description', 'ilike', `%${filters.search}%`)
          .orWhere('categories.name', 'ilike', `%${filters.search}%`);
      });
    }

    if (filters.category_id) {
      query = query.where('powerBis.category_id', filters.category_id);
    }

    if (filters.status) {
      query = query.where('powerBis.status', filters.status);
    }

    const result = await query.count('powerBis.powerbi_id as count').first();
    return parseInt(result.count);
  }

  async findByCategoryId(categoryId) {
    const powerBiList = await db('powerBis')
      .where('category_id', categoryId)
      .where('is_delete', false)
      .orderBy('created_at', 'desc');
    return powerBiList;
  }

  async getStats() {
    const stats = await db('powerBis')
      .where('is_delete', false)
      .select(
        db.raw('COUNT(*) as total'),
        db.raw('COUNT(CASE WHEN status = \'active\' THEN 1 END) as active'),
        db.raw('COUNT(CASE WHEN status = \'inactive\' THEN 1 END) as inactive'),
        db.raw('COUNT(CASE WHEN status = \'draft\' THEN 1 END) as draft')
      )
      .first();
    return stats;
  }

  /**
   * Find PowerBI reports dengan filter standar (pagination, sorting, searching, filtering)
   * @param {Object} queryParams - Parsed query parameters dari parseStandardQuery
   * @returns {Object} Paginated response dengan data dan metadata
   */
  async findWithFilters(queryParams) {
    // Base query untuk data dengan join ke categories
    const baseQuery = db('powerBis')
      .leftJoin('categories', 'powerBis.category_id', 'categories.category_id')
      .where('powerBis.is_delete', false)
      .select(
        'powerBis.*',
        'categories.name as category_name'
      );

    // Query untuk count total records
    const countQuery = buildCountQuery(baseQuery, queryParams);
    const [{ total }] = await countQuery;

    // Apply filters dan pagination ke base query
    const dataQuery = applyStandardFilters(baseQuery.clone(), queryParams);
    const data = await dataQuery;

    // Format response dengan pagination metadata
    return formatPaginatedResponse(data, queryParams.pagination, total);
  }

  /**
   * Find PowerBI reports dengan filter sederhana (tanpa pagination)
   * @param {Object} filters - Filter parameters
   * @returns {Array} Array of PowerBI reports
   */
  async findWithSimpleFilters(filters = {}) {
    let query = db('powerBis')
      .leftJoin('categories', 'powerBis.category_id', 'categories.category_id')
      .where('powerBis.is_delete', false)
      .select(
        'powerBis.*',
        'categories.name as category_name'
      );

    // Apply search
    if (filters.search) {
      query = query.where(function() {
        this.where('powerBis.title', 'ilike', `%${filters.search}%`)
          .orWhere('powerBis.description', 'ilike', `%${filters.search}%`)
          .orWhere('categories.name', 'ilike', `%${filters.search}%`);
      });
    }

    // Apply filters
    if (filters.category_id) {
      query = query.where('powerBis.category_id', filters.category_id);
    }

    if (filters.status) {
      query = query.where('powerBis.status', filters.status);
    }

    // Apply sorting
    if (filters.sort_by) {
      const sortOrder = filters.sort_order || 'asc';
      query = query.orderBy(`powerBis.${filters.sort_by}`, sortOrder);
    } else {
      query = query.orderBy('powerBis.created_at', 'desc');
    }

    return query;
  }
}

module.exports = new PowerBiRepository();
