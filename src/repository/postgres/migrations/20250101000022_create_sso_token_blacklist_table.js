/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('sso_token_blacklist', function(table) {
    table.string('token_jti', 255).primary();
    table.uuid('user_id').notNullable();
    table.string('token_type', 50).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('reason', 255).nullable();
    
    table.foreign('user_id').references('user_id').inTable('users').onDelete('CASCADE');
    
    table.index(['user_id']);
    table.index(['token_type']);
    table.index(['expires_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('sso_token_blacklist');
};
