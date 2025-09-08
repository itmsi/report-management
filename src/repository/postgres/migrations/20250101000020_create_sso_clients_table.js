/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('sso_clients', function(table) {
    table.string('client_id', 100).primary();
    table.string('client_secret', 255).notNullable();
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.json('redirect_uris').notNullable();
    table.json('scopes').defaultTo(JSON.stringify(['read', 'write']));
    table.string('contact_email', 255).nullable();
    table.string('website', 500).nullable();
    table.enum('security_level', ['basic', 'standard', 'high']).defaultTo('standard');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('last_used').nullable();
    
    table.index(['is_active']);
    table.index(['security_level']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('sso_clients');
};
