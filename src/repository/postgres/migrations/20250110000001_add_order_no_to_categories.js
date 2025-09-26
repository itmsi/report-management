/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('categories', (table) => {
    // Add column with default value
    table.integer('order_no').notNullable().defaultTo(0);
    table.index(['order_no']);
  }).then(() => {
    // Update existing records to have unique order_no values
    return knex.raw(`
      UPDATE categories 
      SET order_no = subquery.row_number 
      FROM (
        SELECT category_id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number
        FROM categories 
        WHERE is_delete = false
      ) AS subquery 
      WHERE categories.category_id = subquery.category_id
    `);
  }).then(() => {
    // Add unique constraint after updating existing data
    return knex.schema.alterTable('categories', (table) => {
      table.unique(['order_no', 'is_delete'], 'unique_order_no_per_active_category');
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('categories', (table) => {
    table.dropIndex(['order_no']);
    table.dropUnique(['order_no', 'is_delete'], 'unique_order_no_per_active_category');
    table.dropColumn('order_no');
  });
};
