/* eslint-disable implicit-arrow-linebreak */
/**
 * Seeder untuk Super Admin dengan tabel lama (mst_users, mst_role)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const crypto = require('crypto');
  
  // Generate UUID untuk super admin
  const superAdminId = crypto.randomUUID();
  const superAdminRoleId = crypto.randomUUID();
  const locationId = crypto.randomUUID();
  
  // Password: Qwer1234! (sudah di-hash)
  const password = 'f5f87204216904da301f2e7e0590854ea8f3fb384a5e1ef3f6ed94700f65e159641bd0787afa16550a724240f526ac79c6fa2786896b5f655d8dee83a3fbee22';
  const salt = '8c256117a2608fdac000d39223865fc9';
  
  console.log('🌱 Creating Super Admin seeder for legacy tables...');
  
  try {
    // 1. Insert Super Admin Role
    console.log('📝 Inserting Super Admin role...');
    await knex('mst_role').insert({
      role_id: superAdminRoleId,
      role_name: 'Super Admin',
      created_at: new Date().toISOString(),
      created_by: null,
      updated_at: null,
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    });
    
    // 2. Insert Super Admin User
    console.log('👤 Inserting Super Admin user...');
    await knex('mst_users').insert({
      users_id: superAdminId,
      location_id: locationId,
      role_id: superAdminRoleId,
      username: 'superadmin',
      email: 'superadmin@gate.com',
      password: password,
      salt: salt,
      full_name: 'Super Administrator',
      jabatan: 'System Administrator',
      phone_number: '081234567890',
      status: '1',
      created_at: new Date().toISOString(),
      created_by: null,
      updated_at: null,
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    });
    
    console.log('✅ Super Admin seeder completed successfully!');
    console.log(`👤 Super Admin User ID: ${superAdminId}`);
    console.log(`🔑 Super Admin Role ID: ${superAdminRoleId}`);
    console.log('🔑 Login credentials:');
    console.log('   Username: superadmin');
    console.log('   Password: Qwer1234!');
    
  } catch (error) {
    console.error('❌ Error in Super Admin seeder:', error);
    throw error;
  }
};
