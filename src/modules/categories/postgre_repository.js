const knex = require('../../knexfile');
const db = require('knex')(knex[process.env.NODE_ENV || 'development']);

class CategoriesRepository {
  async create(data) {
    const [category] = await db('categories')
      .insert(data)
      .returning('*');
    return category;
  }

  async findById(id) {
    const category = await db('categories')
      .where('category_id', id)
      .where('is_delete', false)
      .first();
    return category;
  }

  async findAll(filters = {}) {
    let query = db('categories')
      .where('is_delete', false);

    // Apply filters
    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
          .orWhere('description', 'ilike', `%${filters.search}%`);
      });
    }

    // Apply sorting
    if (filters.sort_by) {
      const sortOrder = filters.sort_order || 'asc';
      query = query.orderBy(filters.sort_by, sortOrder);
    } else {
      query = query.orderBy('created_at', 'desc');
    }

    return query;
  }

  async update(id, data) {
    const [category] = await db('categories')
      .where('category_id', id)
      .where('is_delete', false)
      .update({
        ...data,
        updated_at: db.fn.now()
      })
      .returning('*');
    return category;
  }

  async softDelete(id, deletedBy) {
    const [category] = await db('categories')
      .where('category_id', id)
      .where('is_delete', false)
      .update({
        is_delete: true,
        deleted_at: db.fn.now(),
        deleted_by: deletedBy
      })
      .returning('*');
    return category;
  }

  async restore(id, updatedBy) {
    const [category] = await db('categories')
      .where('category_id', id)
      .where('is_delete', true)
      .update({
        is_delete: false,
        deleted_at: null,
        deleted_by: null,
        updated_at: db.fn.now(),
        updated_by: updatedBy
      })
      .returning('*');
    return category;
  }

  async count(filters = {}) {
    let query = db('categories')
      .where('is_delete', false);

    // Apply filters
    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
          .orWhere('description', 'ilike', `%${filters.search}%`);
      });
    }

    const result = await query.count('category_id as count').first();
    return parseInt(result.count);
  }

  async findByIdWithPowerBi(id) {
    const category = await db('categories')
      .leftJoin('powerBis', 'categories.category_id', 'powerBis.category_id')
      .where('categories.category_id', id)
      .where('categories.is_delete', false)
      .select(
        'categories.*',
        db.raw('COUNT(powerBis.powerbi_id) as powerbi_count')
      )
      .groupBy('categories.category_id')
      .first();
    return category;
  }
}

module.exports = new CategoriesRepository();
