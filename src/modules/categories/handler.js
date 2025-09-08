const CategoriesRepository = require('./postgre_repository');
const { pagination } = require('../../utils');

class CategoriesHandler {
  async createCategory(req, res) {
    try {
      const { name, description } = req.body;
      const createdBy = req.user?.user_id || null;

      const categoryData = {
        name,
        description,
        created_by: createdBy
      };

      const category = await CategoriesRepository.create(categoryData);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: error.message
      });
    }
  }

  async getCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await CategoriesRepository.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        message: 'Category retrieved successfully',
        data: category
      });
    } catch (error) {
      console.error('Error getting category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get category',
        error: error.message
      });
    }
  }

  async listCategories(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sort_by,
        sort_order
      } = req.query;

      const filters = {
        search,
        sort_by,
        sort_order
      };

      const totalCount = await CategoriesRepository.count(filters);
      const categories = await CategoriesRepository.findAll(filters);

      const paginatedData = pagination(categories, page, limit, totalCount);

      res.json({
        success: true,
        message: 'Categories retrieved successfully',
        ...paginatedData
      });
    } catch (error) {
      console.error('Error listing categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to list categories',
        error: error.message
      });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const updatedBy = req.user?.user_id || null;

      const existingCategory = await CategoriesRepository.findById(id);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const updateData = {
        updated_by: updatedBy
      };

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      const category = await CategoriesRepository.update(id, updateData);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: error.message
      });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.user_id || null;

      const existingCategory = await CategoriesRepository.findById(id);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      await CategoriesRepository.softDelete(id, deletedBy);

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete category',
        error: error.message
      });
    }
  }

  async restoreCategory(req, res) {
    try {
      const { id } = req.params;
      const updatedBy = req.user?.user_id || null;

      const category = await CategoriesRepository.restore(id, updatedBy);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found or already restored'
        });
      }

      res.json({
        success: true,
        message: 'Category restored successfully',
        data: category
      });
    } catch (error) {
      console.error('Error restoring category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to restore category',
        error: error.message
      });
    }
  }

  async getCategoryWithPowerBi(req, res) {
    try {
      const { id } = req.params;

      const category = await CategoriesRepository.findByIdWithPowerBi(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        message: 'Category with PowerBI data retrieved successfully',
        data: category
      });
    } catch (error) {
      console.error('Error getting category with PowerBI:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get category with PowerBI data',
        error: error.message
      });
    }
  }
}

module.exports = new CategoriesHandler();
