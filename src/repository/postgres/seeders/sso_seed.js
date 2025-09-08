/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('roleHasMenuPermissions').del();
  await knex('menuHasPermissions').del();
  await knex('systemHasMenus').del();
  await knex('users').del();
  await knex('employees').del();
  await knex('titles').del();
  await knex('departments').del();
  await knex('companies').del();
  await knex('roles').del();
  await knex('menus').del();
  await knex('permissions').del();
  await knex('systems').del();

  // Insert seed entries
  const systemId = '00000000-0000-0000-0000-000000000001';
  const permissionIds = [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
  ];
  const menuIds = [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
  ];
  const roleId = '00000000-0000-0000-0000-000000000001';
  const companyId = '00000000-0000-0000-0000-000000000001';
  const departmentId = '00000000-0000-0000-0000-000000000001';
  const titleId = '00000000-0000-0000-0000-000000000001';
  const employeeId = '00000000-0000-0000-0000-000000000001';
  const userId = '00000000-0000-0000-0000-000000000001';

  // Insert systems
  await knex('systems').insert([
    {
      system_id: systemId,
      system_name: 'SSO Management System',
      system_url: 'http://localhost:3000',
      system_icon: 'fas fa-shield-alt',
      system_order: 1,
      created_by: userId,
    },
  ]);

  // Insert permissions
  await knex('permissions').insert([
    {
      permission_id: permissionIds[0],
      permission_name: 'create',
      created_by: userId,
    },
    {
      permission_id: permissionIds[1],
      permission_name: 'read',
      created_by: userId,
    },
    {
      permission_id: permissionIds[2],
      permission_name: 'update',
      created_by: userId,
    },
    {
      permission_id: permissionIds[3],
      permission_name: 'delete',
      created_by: userId,
    },
  ]);

  // Insert menus
  await knex('menus').insert([
    {
      menu_id: menuIds[0],
      menu_name: 'Dashboard',
      menu_url: '/dashboard',
      menu_icon: 'fas fa-tachometer-alt',
      menu_order: 1,
      created_by: userId,
    },
    {
      menu_id: menuIds[1],
      menu_name: 'User Management',
      menu_url: '/users',
      menu_icon: 'fas fa-users',
      menu_order: 2,
      created_by: userId,
    },
    {
      menu_id: menuIds[2],
      menu_name: 'Role Management',
      menu_url: '/roles',
      menu_icon: 'fas fa-user-tag',
      menu_order: 3,
      created_by: userId,
    },
    {
      menu_id: menuIds[3],
      menu_name: 'System Settings',
      menu_url: '/settings',
      menu_icon: 'fas fa-cog',
      menu_order: 4,
      created_by: userId,
    },
  ]);

  // Insert system has menus
  await knex('systemHasMenus').insert([
    { system_id: systemId, menu_id: menuIds[0], created_by: userId },
    { system_id: systemId, menu_id: menuIds[1], created_by: userId },
    { system_id: systemId, menu_id: menuIds[2], created_by: userId },
    { system_id: systemId, menu_id: menuIds[3], created_by: userId },
  ]);

  // Insert menu has permissions
  await knex('menuHasPermissions').insert([
    { menu_id: menuIds[0], permission_id: permissionIds[1], created_by: userId }, // Dashboard - read
    { menu_id: menuIds[1], permission_id: permissionIds[0], created_by: userId }, // Users - create
    { menu_id: menuIds[1], permission_id: permissionIds[1], created_by: userId }, // Users - read
    { menu_id: menuIds[1], permission_id: permissionIds[2], created_by: userId }, // Users - update
    { menu_id: menuIds[1], permission_id: permissionIds[3], created_by: userId }, // Users - delete
    { menu_id: menuIds[2], permission_id: permissionIds[0], created_by: userId }, // Roles - create
    { menu_id: menuIds[2], permission_id: permissionIds[1], created_by: userId }, // Roles - read
    { menu_id: menuIds[2], permission_id: permissionIds[2], created_by: userId }, // Roles - update
    { menu_id: menuIds[2], permission_id: permissionIds[3], created_by: userId }, // Roles - delete
    { menu_id: menuIds[3], permission_id: permissionIds[1], created_by: userId }, // Settings - read
    { menu_id: menuIds[3], permission_id: permissionIds[2], created_by: userId }, // Settings - update
  ]);

  // Insert roles
  await knex('roles').insert([
    {
      role_id: roleId,
      role_name: 'Super Admin',
      created_by: userId,
    },
  ]);

  // Insert role has menu permissions
  await knex('roleHasMenuPermissions').insert([
    { role_id: roleId, menu_id: menuIds[0], permission_id: permissionIds[1], created_by: userId }, // Dashboard - read
    { role_id: roleId, menu_id: menuIds[1], permission_id: permissionIds[0], created_by: userId }, // Users - create
    { role_id: roleId, menu_id: menuIds[1], permission_id: permissionIds[1], created_by: userId }, // Users - read
    { role_id: roleId, menu_id: menuIds[1], permission_id: permissionIds[2], created_by: userId }, // Users - update
    { role_id: roleId, menu_id: menuIds[1], permission_id: permissionIds[3], created_by: userId }, // Users - delete
    { role_id: roleId, menu_id: menuIds[2], permission_id: permissionIds[0], created_by: userId }, // Roles - create
    { role_id: roleId, menu_id: menuIds[2], permission_id: permissionIds[1], created_by: userId }, // Roles - read
    { role_id: roleId, menu_id: menuIds[2], permission_id: permissionIds[2], created_by: userId }, // Roles - update
    { role_id: roleId, menu_id: menuIds[2], permission_id: permissionIds[3], created_by: userId }, // Roles - delete
    { role_id: roleId, menu_id: menuIds[3], permission_id: permissionIds[1], created_by: userId }, // Settings - read
    { role_id: roleId, menu_id: menuIds[3], permission_id: permissionIds[2], created_by: userId }, // Settings - update
  ]);

  // Insert companies
  await knex('companies').insert([
    {
      company_id: companyId,
      company_name: 'SSO Company',
      company_address: '123 Main Street, City, Country',
      company_email: 'admin@sso-company.com',
      created_by: userId,
    },
  ]);

  // Insert departments
  await knex('departments').insert([
    {
      department_id: departmentId,
      department_name: 'IT Department',
      company_id: companyId,
      created_by: userId,
    },
  ]);

  // Insert titles
  await knex('titles').insert([
    {
      title_id: titleId,
      title_name: 'System Administrator',
      department_id: departmentId,
      created_by: userId,
    },
  ]);

  // Insert employees
  await knex('employees').insert([
    {
      employee_id: employeeId,
      employee_name: 'Super Admin',
      employee_email: 'admin@sso-company.com',
      title_id: titleId,
      created_by: userId,
    },
  ]);

  // Insert users
  await knex('users').insert([
    {
      user_id: userId,
      employee_id: employeeId,
      role_id: roleId,
      user_name: 'admin',
      user_email: 'admin@sso-company.com',
      user_password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      created_by: userId,
    },
  ]);
};
