/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('user_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('employee_id').notNullable();
    table.uuid('role_id').notNullable();
    table.string('user_name', 100).notNullable();
    table.string('user_email', 100).notNullable();
    table.string('user_password', 255).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.timestamp('updated_at');
    table.uuid('updated_by');
    table.timestamp('deleted_at');
    table.uuid('deleted_by');
    table.boolean('is_delete').defaultTo(false);
    
    table.foreign('employee_id').references('employee_id').inTable('employees').onDelete('CASCADE');
    table.foreign('role_id').references('role_id').inTable('roles').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
