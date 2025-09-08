const UsersRepository = require('./postgre_repository');
const { successResponse, errorResponse } = require('../../utils/response');
const { parseStandardQuery } = require('../../utils/pagination');
const { pgCore } = require('../../config/database');

class UsersHandler {
  constructor() {
    this.usersRepository = new UsersRepository(pgCore);
  }

  async createUser(req, res) {
    try {
      const { user_name, user_email, user_password, employee_id, role_id } = req.body;
      const createdBy = req.user?.user_id;

      if (!user_name || !user_email || !user_password) {
        return errorResponse(res, 'User name, email, and password are required', 400);
      }

      const userData = {
        user_name,
        user_email,
        user_password,
        employee_id,
        role_id,
        created_by: createdBy,
      };

      const user = await this.usersRepository.createUser(userData);

      return successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      console.error('Error creating user:', error);
      return errorResponse(res, 'Failed to create user', 500);
    }
  }

  async getUser(req, res) {
    try {
      const { id } = req.params;

      const user = await this.usersRepository.findById(id);

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, user, 'User retrieved successfully');
    } catch (error) {
      console.error('Error getting user:', error);
      return errorResponse(res, 'Failed to retrieve user', 500);
    }
  }

  async listUsers(req, res) {
    try {
      // Parse query parameters dengan konfigurasi untuk users
      const queryParams = parseStandardQuery(req, {
        allowedSortColumns: ['user_name', 'user_email', 'employee_id', 'role_id', 'created_at', 'updated_at'],
        defaultSort: ['user_name', 'asc'],
        searchableColumns: ['user_name', 'user_email'],
        allowedFilters: ['employee_id', 'role_id', 'is_delete'],
        dateColumn: 'created_at'
      });

      // Gunakan method baru dengan filter standar
      const result = await this.usersRepository.findWithFilters(queryParams);

      return successResponse(res, result, 'Users retrieved successfully');
    } catch (error) {
      console.error('Error listing users:', error);
      return errorResponse(res, 'Failed to retrieve users', 500);
    }
  }

  async getUserPermissions(req, res) {
    try {
      const { id } = req.params;
      // Implementasi sederhana - bisa dikembangkan lebih lanjut
      return successResponse(res, [], 'User permissions retrieved successfully');
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return errorResponse(res, 'Failed to retrieve user permissions', 500);
    }
  }

  async login(req, res) {
    try {
      const { user_email, user_password } = req.body;

      if (!user_email || !user_password) {
        return errorResponse(res, 'Email and password are required', 400);
      }

      const user = await this.usersRepository.findByEmail(user_email);

      if (!user) {
        return errorResponse(res, 'Invalid credentials', 401);
      }

      // Implementasi sederhana - bisa ditambahkan bcrypt untuk password
      if (user.user_password !== user_password) {
        return errorResponse(res, 'Invalid credentials', 401);
      }

      return successResponse(res, user, 'Login successful');
    } catch (error) {
      console.error('Error during login:', error);
      return errorResponse(res, 'Failed to login', 500);
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { user_name, user_email, employee_id, role_id } = req.body;
      const updatedBy = req.user?.user_id;

      const user = await this.usersRepository.findById(id);

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      const updateData = {
        updated_by: updatedBy,
      };

      if (user_name) updateData.user_name = user_name;
      if (user_email) updateData.user_email = user_email;
      if (employee_id) updateData.employee_id = employee_id;
      if (role_id) updateData.role_id = role_id;

      const updatedUser = await this.usersRepository.updateUser(id, updateData);

      return successResponse(res, updatedUser, 'User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      return errorResponse(res, 'Failed to update user', 500);
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.user_id;

      const user = await this.usersRepository.findById(id);

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      await this.usersRepository.deleteUser(id, deletedBy);

      return successResponse(res, null, 'User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      return errorResponse(res, 'Failed to delete user', 500);
    }
  }

  async changePassword(req, res) {
    try {
      const { user_id, old_password, new_password } = req.body;

      if (!user_id || !old_password || !new_password) {
        return errorResponse(res, 'User ID, old password, and new password are required', 400);
      }

      const user = await this.usersRepository.findById(user_id);

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // Implementasi sederhana - bisa ditambahkan bcrypt untuk password
      if (user.user_password !== old_password) {
        return errorResponse(res, 'Old password is incorrect', 400);
      }

      await this.usersRepository.updateUser(user_id, { user_password: new_password });

      return successResponse(res, null, 'Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      return errorResponse(res, 'Failed to change password', 500);
    }
  }
}

module.exports = new UsersHandler();