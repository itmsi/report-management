/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('categories').del();
  
  // Inserts seed entries
  await knex('categories').insert([
    {
      category_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Sales Report',
      description: 'Reports related to sales performance and metrics',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Financial Report',
      description: 'Financial statements and accounting reports',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Marketing Report',
      description: 'Marketing campaigns and performance analytics',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'HR Report',
      description: 'Human resources and employee management reports',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'Operations Report',
      description: 'Operational efficiency and process reports',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440006',
      name: 'Customer Analytics',
      description: 'Customer behavior and satisfaction reports',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440007',
      name: 'Inventory Report',
      description: 'Stock management and inventory tracking',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440008',
      name: 'Quality Control',
      description: 'Quality metrics and compliance reports',
      created_by: null,
      updated_by: null,
      deleted_by: null
    }
  ]);
};
