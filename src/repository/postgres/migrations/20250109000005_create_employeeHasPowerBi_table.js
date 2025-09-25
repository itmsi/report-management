/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('employeeHasPowerBi', (table) => {
    table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('employee_id').notNullable();
    table.uuid('powerbi_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').nullable();
    table.timestamp('deleted_at').nullable();
    table.boolean('is_delete').defaultTo(false);
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();
    table.uuid('deleted_by').nullable();
    
    // Foreign key constraints
    table.foreign('powerbi_id').references('powerbi_id').inTable('powerBis').onDelete('CASCADE');
    
    // Indexes for better performance
    table.index(['employee_id']);
    table.index(['powerbi_id']);
    table.index(['is_delete']);
    table.index(['created_at']);
    
    // Unique constraint to prevent duplicate employee-powerbi relationships
    table.unique(['employee_id', 'powerbi_id'], 'unique_employee_powerbi');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('employeeHasPowerBi');
};
