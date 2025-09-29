/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('categories', (table) => {
    // Remove the unique constraint on order_no and is_delete
    table.dropUnique(['order_no', 'is_delete'], 'unique_order_no_per_active_category');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('categories', (table) => {
    // Re-add the unique constraint if needed to rollback
    table.unique(['order_no', 'is_delete'], 'unique_order_no_per_active_category');
  });
};
