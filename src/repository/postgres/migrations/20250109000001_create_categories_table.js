/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('categories', (table) => {
    table.uuid('category_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('name', 100).notNullable();
    table.text('description').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').nullable();
    table.timestamp('deleted_at').nullable();
    table.boolean('is_delete').defaultTo(false);
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();
    table.uuid('deleted_by').nullable();
    
    // Indexes for better performance
    table.index(['name']);
    table.index(['is_delete']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('categories');
};
