/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('powerBis').del();
  
  // Inserts seed entries
  await knex('powerBis').insert([
    {
      powerbi_id: '660e8400-e29b-41d4-a716-446655440001',
      category_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Monthly Sales Dashboard',
      link: 'https://app.powerbi.com/reportEmbed?reportId=sales-dashboard-001',
      status: 'active',
      file: '/uploads/powerbi/sales-dashboard-001.pbix',
      description: 'Comprehensive monthly sales performance dashboard with KPIs and trends',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      powerbi_id: '660e8400-e29b-41d4-a716-446655440002',
      category_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Quarterly Sales Analysis',
      link: 'https://app.powerbi.com/reportEmbed?reportId=quarterly-sales-002',
      status: 'active',
      file: '/uploads/powerbi/quarterly-sales-002.pbix',
      description: 'Detailed quarterly sales analysis with regional breakdown',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      powerbi_id: '660e8400-e29b-41d4-a716-446655440003',
      category_id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Financial Statement Dashboard',
      link: 'https://app.powerbi.com/reportEmbed?reportId=financial-statement-003',
      status: 'active',
      file: '/uploads/powerbi/financial-statement-003.pbix',
      description: 'Real-time financial statements and P&L analysis',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      powerbi_id: '660e8400-e29b-41d4-a716-446655440004',
      category_id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Budget vs Actual Report',
      link: 'https://app.powerbi.com/reportEmbed?reportId=budget-actual-004',
      status: 'active',
      file: '/uploads/powerbi/budget-actual-004.pbix',
      description: 'Budget variance analysis and forecasting',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      powerbi_id: '660e8400-e29b-41d4-a716-446655440005',
      category_id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Marketing Campaign Performance',
      link: 'https://app.powerbi.com/reportEmbed?reportId=marketing-campaign-005',
      status: 'active',
      file: '/uploads/powerbi/marketing-campaign-005.pbix',
      description: 'Marketing campaign ROI and performance metrics',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      powerbi_id: '660e8400-e29b-41d4-a716-446655440006',
      category_id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Social Media Analytics',
      link: 'https://app.powerbi.com/reportEmbed?reportId=social-media-006',
      status: 'draft',
      file: '/uploads/powerbi/social-media-006.pbix',
      description: 'Social media engagement and reach analytics',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      powerbi_id: '660e8400-e29b-41d4-a716-446655440007',
      category_id: '550e8400-e29b-41d4-a716-446655440004',
      title: 'Employee Performance Dashboard',
      link: 'https://app.powerbi.com/reportEmbed?reportId=employee-performance-007',
      status: 'active',
      file: '/uploads/powerbi/employee-performance-007.pbix',
      description: 'Employee KPI tracking and performance evaluation',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      powerbi_id: '660e8400-e29b-41d4-a716-446655440008',
      category_id: '550e8400-e29b-41d4-a716-446655440004',
      title: 'HR Analytics Report',
      link: 'https://app.powerbi.com/reportEmbed?reportId=hr-analytics-008',
      status: 'active',
      file: '/uploads/powerbi/hr-analytics-008.pbix',
      description: 'HR metrics including turnover, recruitment, and satisfaction',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      powerbi_id: '660e8400-e29b-41d4-a716-446655440009',
      category_id: '550e8400-e29b-41d4-a716-446655440005',
      title: 'Operational Efficiency Dashboard',
      link: 'https://app.powerbi.com/reportEmbed?reportId=operational-efficiency-009',
      status: 'active',
      file: '/uploads/powerbi/operational-efficiency-009.pbix',
      description: 'Operations KPIs and process efficiency metrics',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      powerbi_id: '660e8400-e29b-41d4-a716-446655440010',
      category_id: '550e8400-e29b-41d4-a716-446655440006',
      title: 'Customer Satisfaction Survey',
      link: 'https://app.powerbi.com/reportEmbed?reportId=customer-satisfaction-010',
      status: 'active',
      file: '/uploads/powerbi/customer-satisfaction-010.pbix',
      description: 'Customer satisfaction scores and feedback analysis',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      powerbi_id: '660e8400-e29b-41d4-a716-446655440011',
      category_id: '550e8400-e29b-41d4-a716-446655440007',
      title: 'Inventory Management Dashboard',
      link: 'https://app.powerbi.com/reportEmbed?reportId=inventory-management-011',
      status: 'active',
      file: '/uploads/powerbi/inventory-management-011.pbix',
      description: 'Real-time inventory levels and stock movement tracking',
      created_by: null,
      updated_by: null,
      deleted_by: null
    },
    {
      powerbi_id: '660e8400-e29b-41d4-a716-446655440012',
      category_id: '550e8400-e29b-41d4-a716-446655440008',
      title: 'Quality Control Metrics',
      link: 'https://app.powerbi.com/reportEmbed?reportId=quality-control-012',
      status: 'inactive',
      file: '/uploads/powerbi/quality-control-012.pbix',
      description: 'Quality metrics and compliance monitoring dashboard',
      created_by: null,
      updated_by: null,
      deleted_by: null
    }
  ]);
};
