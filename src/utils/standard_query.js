/**
 * Standard Query Utilities
 * Utility functions untuk parsing query parameters yang terstandarisasi
 * untuk semua module dalam sistem Report Management
 */

const { PAGE, LIMIT } = require('./constant');

/**
 * Parse query parameters untuk pagination
 * @param {Object} req - Express request object
 * @returns {Object} Pagination parameters
 */
const parsePagination = (req) => {
  const page = parseInt(req.query.page) || PAGE;
  const limit = parseInt(req.query.limit) || LIMIT;
  
  // Validasi limit maksimal
  const maxLimit = 100;
  const validLimit = Math.min(limit, maxLimit);
  
  return {
    page: Math.max(1, page),
    limit: Math.max(1, validLimit),
    offset: (Math.max(1, page) - 1) * Math.max(1, validLimit)
  };
};

/**
 * Parse query parameters untuk sorting
 * @param {Object} req - Express request object
 * @param {Array} allowedColumns - Array kolom yang diizinkan untuk sorting
 * @param {Array} defaultOrder - Default order [column, direction]
 * @returns {Object} Sorting parameters
 */
const parseSorting = (req, allowedColumns = [], defaultOrder = ['created_at', 'desc']) => {
  const sortBy = req.query.sort_by || defaultOrder[0];
  const sortOrder = req.query.sort_order || defaultOrder[1];
  
  // Validasi kolom yang diizinkan
  const validColumn = allowedColumns.length > 0 && allowedColumns.includes(sortBy) 
    ? sortBy 
    : (defaultOrder[0] || 'created_at');
  
  // Validasi order direction
  const validOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) 
    ? sortOrder.toLowerCase() 
    : (defaultOrder[1] || 'desc');
  
  return {
    sortBy: validColumn,
    sortOrder: validOrder,
  };
};

/**
 * Parse query parameters untuk searching
 * @param {Object} req - Express request object
 * @param {Array} searchableColumns - Array kolom yang bisa di-search
 * @returns {Object} Search parameters
 */
const parseSearch = (req, searchableColumns = []) => {
  const searchTerm = req.query.search || req.query.q || '';
  
  return {
    searchTerm: searchTerm.trim(),
    searchableColumns,
  };
};

/**
 * Parse query parameters untuk filtering
 * @param {Object} req - Express request object
 * @param {Array} allowedFilters - Array kolom yang diizinkan untuk filter
 * @returns {Object} Filter parameters
 */
const parseFilters = (req, allowedFilters = []) => {
  const filters = {};
  
  if (allowedFilters.length === 0) {
    return filters;
  }
  
  allowedFilters.forEach(filterKey => {
    if (req.query[filterKey] !== undefined && req.query[filterKey] !== '') {
      filters[filterKey] = req.query[filterKey];
    }
  });
  
  return filters;
};

/**
 * Parse semua query parameters sekaligus
 * @param {Object} req - Express request object
 * @param {Object} options - Konfigurasi parsing
 * @returns {Object} Parsed query parameters
 */
const parseStandardQuery = (req, options = {}) => {
  const {
    allowedColumns = [],
    defaultOrder = ['created_at', 'desc'],
    searchableColumns = [],
    allowedFilters = []
  } = options;
  
  const pagination = parsePagination(req);
  const sorting = parseSorting(req, allowedColumns, defaultOrder);
  const search = parseSearch(req, searchableColumns);
  const filters = parseFilters(req, allowedFilters);
  
  return {
    pagination,
    sorting,
    search,
    filters,
    // Legacy compatibility
    page: pagination.page,
    limit: pagination.limit,
    offset: pagination.offset,
    sort_by: sorting.sortBy,
    sort_order: sorting.sortOrder,
    search: search.searchTerm
  };
};

/**
 * Build query untuk count total records
 * @param {Object} baseQuery - Base Knex query
 * @param {Object} queryParams - Parsed query parameters
 * @returns {Object} Count query
 */
const buildCountQuery = (baseQuery, queryParams) => {
  let countQuery = baseQuery.clone();
  
  // Apply search
  if (queryParams.search.searchTerm && queryParams.search.searchableColumns.length > 0) {
    countQuery = countQuery.where(function() {
      queryParams.search.searchableColumns.forEach((column, index) => {
        if (index === 0) {
          this.where(column, 'ilike', `%${queryParams.search.searchTerm}%`);
        } else {
          this.orWhere(column, 'ilike', `%${queryParams.search.searchTerm}%`);
        }
      });
    });
  }
  
  // Apply filters
  Object.keys(queryParams.filters).forEach(filterKey => {
    const filterValue = queryParams.filters[filterKey];
    if (filterValue !== undefined && filterValue !== '') {
      countQuery = countQuery.where(filterKey, filterValue);
    }
  });
  
  return countQuery;
};

/**
 * Apply standard filters ke query
 * @param {Object} baseQuery - Base Knex query
 * @param {Object} queryParams - Parsed query parameters
 * @returns {Object} Filtered query
 */
const applyStandardFilters = (baseQuery, queryParams) => {
  let query = baseQuery;
  
  // Apply search
  if (queryParams.search.searchTerm && queryParams.search.searchableColumns.length > 0) {
    query = query.where(function() {
      queryParams.search.searchableColumns.forEach((column, index) => {
        if (index === 0) {
          this.where(column, 'ilike', `%${queryParams.search.searchTerm}%`);
        } else {
          this.orWhere(column, 'ilike', `%${queryParams.search.searchTerm}%`);
        }
      });
    });
  }
  
  // Apply filters
  Object.keys(queryParams.filters).forEach(filterKey => {
    const filterValue = queryParams.filters[filterKey];
    if (filterValue !== undefined && filterValue !== '') {
      query = query.where(filterKey, filterValue);
    }
  });
  
  // Apply sorting
  query = query.orderBy(queryParams.sorting.sortBy, queryParams.sorting.sortOrder);
  
  // Apply pagination
  query = query.limit(queryParams.pagination.limit).offset(queryParams.pagination.offset);
  
  return query;
};

/**
 * Format response dengan pagination metadata
 * @param {Array} data - Data array
 * @param {Object} pagination - Pagination parameters
 * @param {Number} total - Total records
 * @returns {Object} Formatted response
 */
const formatPaginatedResponse = (data, pagination, total) => {
  const totalPages = Math.ceil(total / pagination.limit);
  const hasNextPage = pagination.page < totalPages;
  const hasPrevPage = pagination.page > 1;
  
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? pagination.page + 1 : null,
      prevPage: hasPrevPage ? pagination.page - 1 : null
    }
  };
};

/**
 * Standard error response untuk query parsing
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @returns {Object} Error response
 */
const sendQueryError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
};

/**
 * Standard success response untuk query results
 * @param {Object} res - Express response object
 * @param {Object} result - Query result dengan pagination
 * @param {String} message - Success message
 * @returns {Object} Success response
 */
const sendQuerySuccess = (res, result, message) => {
  return res.json({
    success: true,
    message,
    ...result
  });
};

module.exports = {
  parsePagination,
  parseSorting,
  parseSearch,
  parseFilters,
  parseStandardQuery,
  buildCountQuery,
  applyStandardFilters,
  formatPaginatedResponse,
  sendQueryError,
  sendQuerySuccess
};
