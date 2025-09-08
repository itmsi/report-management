/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('sso_authorization_codes', function(table) {
    table.string('code', 255).primary();
    table.string('client_id', 100).notNullable();
    table.uuid('user_id').notNullable();
    table.string('redirect_uri', 500).notNullable();
    table.json('scopes').nullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.boolean('used').defaultTo(false);
    
    table.foreign('client_id').references('client_id').inTable('sso_clients').onDelete('CASCADE');
    table.foreign('user_id').references('user_id').inTable('users').onDelete('CASCADE');
    
    table.index(['client_id']);
    table.index(['user_id']);
    table.index(['expires_at']);
    table.index(['used']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('sso_authorization_codes');
};
