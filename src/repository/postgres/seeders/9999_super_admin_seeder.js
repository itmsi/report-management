/* eslint-disable implicit-arrow-linebreak */
/**
 * Seeder untuk Super Admin dengan semua permission
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const crypto = require('crypto');
  
  // Generate UUID untuk super admin
  const superAdminId = crypto.randomUUID();
  const superAdminRoleId = crypto.randomUUID();
  const employeeId = crypto.randomUUID();
  const titleId = crypto.randomUUID();
  const departmentId = crypto.randomUUID();
  const companyId = crypto.randomUUID();
  
  // Password: admin123 (sudah di-hash)
  const password = 'a22512591ddc3de03193be8a23d9c6be62959c29ed524c75962684b72a8824c2ee1bf5a3920e98a6eb2f548089608374cd5fba96e3a12e26563034376a9239c14b6cb069544bd1ef6fe580c5b17bf805f7f2cf8bb9b7517612cc9e97a0e1d12a61b80bf0';
  const salt = 'dbe2be1f86881e5d53fe1638e30b154f';
  
  console.log('🌱 Creating Super Admin seeder...');
  
  try {
    // 1. Insert Super Admin Role
    console.log('📝 Inserting Super Admin role...');
    await knex('roles').insert({
      role_id: superAdminRoleId,
      role_name: 'Super Admin',
      created_at: new Date().toISOString(),
      created_by: null,
      updated_at: null,
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    });
    
    // 2. Insert Super Admin Company
    console.log('🏢 Inserting Super Admin company...');
    await knex('companies').insert({
      company_id: companyId,
      company_name: 'Gate System',
      company_parent_id: null,
      company_address: 'System Headquarters',
      company_email: 'admin@gate.com',
      created_at: new Date().toISOString(),
      created_by: null,
      updated_at: null,
      updated_by: null,
      deleted_at: null,
      deleted_by: null,
      is_delete: false
    });
    
    // 3. Insert Super Admin Department
    console.log('🏢 Inserting Super Admin department...');
    await knex('departments').insert({
      department_id: departmentId,
      department_name: 'IT Administration',
      department_parent_id: null,
      company_id: companyId,
      created_at: new Date().toISOString(),
      created_by: null,
      updated_at: null,
      updated_by: null,
      deleted_at: null,
      deleted_by: null,
      is_delete: false
    });
    
    // 4. Insert Super Admin Title
    console.log('👔 Inserting Super Admin title...');
    await knex('titles').insert({
      title_id: titleId,
      title_name: 'Super Administrator',
      department_id: departmentId,
      created_at: new Date().toISOString(),
      created_by: null,
      updated_at: null,
      updated_by: null,
      deleted_at: null,
      deleted_by: null,
      is_delete: false
    });
    
    // 5. Insert Super Admin Employee
    console.log('👤 Inserting Super Admin employee...');
    await knex('employees').insert({
      employee_id: employeeId,
      employee_name: 'Super Administrator',
      employee_email: 'superadmin@gate.com',
      title_id: titleId,
      created_at: new Date().toISOString(),
      created_by: null,
      updated_at: null,
      updated_by: null,
      deleted_at: null,
      deleted_by: null,
      is_delete: false
    });
    
    // 6. Insert Super Admin User
    console.log('👤 Inserting Super Admin user...');
    await knex('users').insert({
      user_id: superAdminId,
      employee_id: employeeId,
      role_id: superAdminRoleId,
      user_name: 'superadmin',
      user_email: 'superadmin@gate.com',
      user_password: password,
      created_at: new Date().toISOString(),
      created_by: null,
      updated_at: null,
      updated_by: null,
      deleted_at: null,
      deleted_by: null,
      is_delete: false
    });
    
    // 7. Get all permissions
    console.log('🔐 Getting all permissions...');
    const permissions = await knex('permissions').select('permission_id');
    
    // 8. Get all menus
    console.log('📋 Getting all menus...');
    const menus = await knex('menus').select('menu_id');
    
    // 9. Insert all menu-permission combinations for Super Admin role
    console.log('🔗 Assigning all permissions to Super Admin role...');
    const rolePermissions = [];
    
    for (const menu of menus) {
      for (const permission of permissions) {
        rolePermissions.push({
          menu_id: menu.menu_id,
          permission_id: permission.permission_id,
          role_id: superAdminRoleId,
          created_at: new Date().toISOString(),
          created_by: superAdminId,
          updated_at: null,
          updated_by: null
        });
      }
    }
    
    // Insert role permissions in batches
    const batchSize = 1000;
    for (let i = 0; i < rolePermissions.length; i += batchSize) {
      const batch = rolePermissions.slice(i, i + batchSize);
      await knex('roleHasMenuPermissions').insert(batch);
    }
    
    console.log('✅ Super Admin seeder completed successfully!');
    console.log(`👤 Super Admin User ID: ${superAdminId}`);
    console.log(`🔑 Super Admin Role ID: ${superAdminRoleId}`);
    console.log(`📊 Total permissions assigned: ${rolePermissions.length}`);
    console.log('🔑 Login credentials:');
    console.log('   Username: superadmin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error in Super Admin seeder:', error);
    throw error;
  }
};
