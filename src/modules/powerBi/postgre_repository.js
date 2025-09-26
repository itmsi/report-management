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
      .where('categories.is_delete', false)
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
      .where('categories.is_delete', false)
      .select(
        'powerBis.*',
        'categories.name as category_name'
      );

    // Apply filters
    if (filters.search) {
      query = query.where(function() {
        this.where('powerBis.title', 'ilike', `%${filters.search}%`)
          .orWhere('powerBis.description', 'ilike', `%${filters.search}%`);
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
      .where('powerBis.is_delete', false)
      .where('categories.is_delete', false);

    // Apply filters
    if (filters.search) {
      query = query.where(function() {
        this.where('powerBis.title', 'ilike', `%${filters.search}%`)
          .orWhere('powerBis.description', 'ilike', `%${filters.search}%`);
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
      .where('categories.is_delete', false)
      .select(
        'powerBis.*',
        'categories.name as category_name',
        'categories.order_no as category_order_no'
      );

    // Simpan custom filters untuk digunakan di count query
    const customFilters = {
      category_name: queryParams.filters.category_name,
      title_filter: queryParams.filters.title_filter,
      description_filter: queryParams.filters.description_filter,
      start_date: queryParams.filters.start_date,
      end_date: queryParams.filters.end_date
    };
    
    // Handle custom filters untuk base query
    if (queryParams.filters.category_name) {
      baseQuery.where('categories.name', 'ilike', `%${queryParams.filters.category_name}%`);
      // Remove category_name dari filters agar tidak diproses lagi di applyStandardFilters
      delete queryParams.filters.category_name;
    }
    
    if (queryParams.filters.title_filter) {
      baseQuery.where('powerBis.title', 'ilike', `%${queryParams.filters.title_filter}%`);
      delete queryParams.filters.title_filter;
    }
    
    if (queryParams.filters.description_filter) {
      baseQuery.where('powerBis.description', 'ilike', `%${queryParams.filters.description_filter}%`);
      delete queryParams.filters.description_filter;
    }
    
    // if (queryParams.filters.start_date) {
    //   baseQuery.where('powerBis.created_at', '>=', queryParams.filters.start_date);
    //   delete queryParams.filters.start_date;
    // }
    
    // if (queryParams.filters.end_date) {
    //   baseQuery.where('powerBis.created_at', '<=', queryParams.filters.end_date);
    //   delete queryParams.filters.end_date;
    // }

    // Query untuk count total records - buat query terpisah untuk count
    const countQuery = db('powerBis')
      .leftJoin('categories', 'powerBis.category_id', 'categories.category_id')
      .where('powerBis.is_delete', false)
      .where('categories.is_delete', false)
      .count('* as total');
    
    // Apply custom filters yang sama untuk count query
    if (customFilters.category_name) {
      countQuery.where('categories.name', 'ilike', `%${customFilters.category_name}%`);
    }
    
    if (customFilters.title_filter) {
      countQuery.where('powerBis.title', 'ilike', `%${customFilters.title_filter}%`);
    }
    
    if (customFilters.description_filter) {
      countQuery.where('powerBis.description', 'ilike', `%${customFilters.description_filter}%`);
    }
    
    if (customFilters.start_date) {
      countQuery.where('powerBis.created_at', '>=', customFilters.start_date);
    }
    
    if (customFilters.end_date) {
      countQuery.where('powerBis.created_at', '<=', customFilters.end_date);
    }
    
    // Apply standard filters untuk count query
    Object.keys(queryParams.filters).forEach(filterKey => {
      const filterValue = queryParams.filters[filterKey];
      if (filterValue !== undefined && filterValue !== '') {
        if (filterKey === 'status') {
          countQuery.where('powerBis.status', 'ilike', `%${filterValue}%`);
        } else if (filterKey === 'category_id') {
          countQuery.where('powerBis.category_id', filterValue);
        } else if (filterKey === 'created_by') {
          countQuery.where('powerBis.created_by', filterValue);
        } else if (filterKey === 'updated_by') {
          countQuery.where('powerBis.updated_by', filterValue);
        } else if (filterKey === 'title') {
          countQuery.where('powerBis.title', 'ilike', `%${filterValue}%`);
        } else if (filterKey === 'description') {
          countQuery.where('powerBis.description', 'ilike', `%${filterValue}%`);
        }
      }
    });
    
    // Apply search untuk count query - cari di kolom title dan description tabel powerBis
    if (queryParams.search.searchTerm) {
      countQuery.where(function() {
        this.where('powerBis.title', 'ilike', `%${queryParams.search.searchTerm}%`)
          .orWhere('powerBis.description', 'ilike', `%${queryParams.search.searchTerm}%`);
      });
    }
    
    const [{ total }] = await countQuery;

    // Apply filters dan pagination ke base query dengan custom handling
    let dataQuery = baseQuery.clone();
    
    // Apply search - cari di kolom title dan description tabel powerBis
    if (queryParams.search.searchTerm) {
      dataQuery = dataQuery.where(function() {
        this.where('powerBis.title', 'ilike', `%${queryParams.search.searchTerm}%`)
          .orWhere('powerBis.description', 'ilike', `%${queryParams.search.searchTerm}%`);
      });
    }
    
    // Apply standard filters dengan prefix tabel yang benar
    Object.keys(queryParams.filters).forEach(filterKey => {
      const filterValue = queryParams.filters[filterKey];
      if (filterValue !== undefined && filterValue !== '') {
        if (filterKey === 'status') {
          dataQuery = dataQuery.where('powerBis.status', 'ilike', `%${filterValue}%`);
        } else if (filterKey === 'category_id') {
          dataQuery = dataQuery.where('powerBis.category_id', filterValue);
        } else if (filterKey === 'created_by') {
          dataQuery = dataQuery.where('powerBis.created_by', filterValue);
        } else if (filterKey === 'updated_by') {
          dataQuery = dataQuery.where('powerBis.updated_by', filterValue);
        } else if (filterKey === 'title') {
          dataQuery = dataQuery.where('powerBis.title', 'ilike', `%${filterValue}%`);
        } else if (filterKey === 'description') {
          dataQuery = dataQuery.where('powerBis.description', 'ilike', `%${filterValue}%`);
        }
      }
    });
    
    // Apply sorting dengan prefix tabel yang benar
    const sortColumn = queryParams.sorting.sortBy === 'category_id' ? 'powerBis.category_id' : 
                     queryParams.sorting.sortBy === 'title' ? 'powerBis.title' :
                     queryParams.sorting.sortBy === 'status' ? 'powerBis.status' :
                     queryParams.sorting.sortBy === 'created_at' ? 'powerBis.created_at' :
                     queryParams.sorting.sortBy === 'updated_at' ? 'powerBis.updated_at' :
                     queryParams.sorting.sortBy === 'powerbi_id' ? 'powerBis.powerbi_id' :
                     queryParams.sorting.sortBy === 'order_no' ? 'categories.order_no' :
                     'powerBis.created_at';
    
    dataQuery = dataQuery.orderBy(sortColumn, queryParams.sorting.sortOrder);
    
    // Apply pagination
    dataQuery = dataQuery.limit(queryParams.pagination.limit).offset(queryParams.pagination.offset);
    
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
      .where('categories.is_delete', false)
      .select(
        'powerBis.*',
        'categories.name as category_name'
      );

    // Apply search
    if (filters.search) {
      query = query.where(function() {
        this.where('powerBis.title', 'ilike', `%${filters.search}%`)
          .orWhere('powerBis.description', 'ilike', `%${filters.search}%`);
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
