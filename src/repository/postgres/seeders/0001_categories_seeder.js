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
      order_no: 1,
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Financial Report',
      description: 'Financial statements and accounting reports',
      order_no: 2,
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Marketing Report',
      description: 'Marketing campaigns and performance analytics',
      order_no: 3,
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'HR Report',
      description: 'Human resources and employee management reports',
      order_no: 4,
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'Operations Report',
      description: 'Operational efficiency and process reports',
      order_no: 5,
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440006',
      name: 'Customer Analytics',
      description: 'Customer behavior and satisfaction reports',
      order_no: 6,
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440007',
      name: 'Inventory Report',
      description: 'Stock management and inventory tracking',
      order_no: 7,
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      category_id: '550e8400-e29b-41d4-a716-446655440008',
      name: 'Quality Control',
      description: 'Quality metrics and compliance reports',
      order_no: 8,
      created_by: null,
      updated_by: null,
      deleted_by: null
    }
  ]);
};
