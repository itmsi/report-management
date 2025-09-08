/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('powerBis', (table) => {
    table.uuid('powerbi_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('category_id').notNullable();
    table.string('title', 200).notNullable();
    table.text('link').notNullable();
    table.string('status', 50).notNullable().defaultTo('active');
    table.text('file').nullable();
    table.text('description').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').nullable();
    table.timestamp('deleted_at').nullable();
    table.boolean('is_delete').defaultTo(false);
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();
    table.uuid('deleted_by').nullable();
    
    // Foreign key constraint
    table.foreign('category_id').references('category_id').inTable('categories').onDelete('CASCADE');
    
    // Indexes for better performance
    table.index(['category_id']);
    table.index(['status']);
    table.index(['is_delete']);
    table.index(['created_at']);
    table.index(['title']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('powerBis');
};
