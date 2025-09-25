const knex = require('../../knexfile');
const db = require('knex')(knex[process.env.NODE_ENV || 'development']);

class EmployeeHasPowerBiRepository {
  async createEmployeePowerBiRelations(powerbiId, employeeIds, createdBy = null) {
    try {
      // First, hard delete any existing relations for this powerbiId to avoid unique constraint issues
      await db('employeeHasPowerBi')
        .where('powerbi_id', powerbiId)
        .del();

      const relations = employeeIds.map(employeeId => ({
        employee_id: employeeId,
        powerbi_id: powerbiId,
        created_by: createdBy
      }));

      return await db('employeeHasPowerBi').insert(relations).returning('*');
    } catch (error) {
      console.error('Error creating employee PowerBI relations:', error);
      throw error;
    }
  }

  async getEmployeesByPowerBiId(powerbiId) {
    try {
      return await db('employeeHasPowerBi')
        .select('employee_id')
        .where('powerbi_id', powerbiId)
        .andWhere('is_delete', false);
    } catch (error) {
      console.error('Error getting employees by PowerBI ID:', error);
      throw error;
    }
  }

  async getPowerBisByEmployeeId(employeeId) {
    try {
      return await db('employeeHasPowerBi')
        .select('powerbi_id')
        .where('employee_id', employeeId)
        .andWhere('is_delete', false);
    } catch (error) {
      console.error('Error getting PowerBIs by employee ID:', error);
      throw error;
    }
  }

  async deleteRelationsByPowerBiId(powerbiId, deletedBy = null) {
    try {
      return await db('employeeHasPowerBi')
        .where('powerbi_id', powerbiId)
        .update({
          is_delete: true,
          deleted_at: db.fn.now(),
          deleted_by: deletedBy
        });
    } catch (error) {
      console.error('Error deleting relations by PowerBI ID:', error);
      throw error;
    }
  }

  async restoreRelationsByPowerBiId(powerbiId, updatedBy = null) {
    try {
      return await db('employeeHasPowerBi')
        .where('powerbi_id', powerbiId)
        .update({
          is_delete: false,
          deleted_at: null,
          deleted_by: null,
          updated_at: db.fn.now(),
          updated_by: updatedBy
        });
    } catch (error) {
      console.error('Error restoring relations by PowerBI ID:', error);
      throw error;
    }
  }
}

module.exports = new EmployeeHasPowerBiRepository();
