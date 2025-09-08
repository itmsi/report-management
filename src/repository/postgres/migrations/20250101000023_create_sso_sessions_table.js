/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('sso_sessions', function(table) {
    table.string('session_id', 255).primary();
    table.uuid('user_id').notNullable();
    table.string('client_id', 100).notNullable();
    table.json('token_payload').nullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('last_activity').defaultTo(knex.fn.now());
    table.string('ip_address', 45).nullable();
    table.string('user_agent', 500).nullable();
    table.boolean('is_active').defaultTo(true);
    
    table.foreign('user_id').references('user_id').inTable('users').onDelete('CASCADE');
    table.foreign('client_id').references('client_id').inTable('sso_clients').onDelete('CASCADE');
    
    table.index(['user_id']);
    table.index(['client_id']);
    table.index(['expires_at']);
    table.index(['is_active']);
    table.index(['last_activity']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('sso_sessions');
};
