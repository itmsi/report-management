const express = require('express');
const router = express.Router();
const CategoriesHandler = require('./handler');
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateGetCategory,
  validateDeleteCategory,
  validateListCategories,
  handleValidationErrors
} = require('./validation');
const { verifyToken } = require('../../middlewares');

// Create category
router.post('/',
  verifyToken,
  validateCreateCategory,
  handleValidationErrors,
  CategoriesHandler.createCategory
);

// Get category by ID
router.get('/:id',
  verifyToken,
  validateGetCategory,
  handleValidationErrors,
  CategoriesHandler.getCategory
);

// List categories with pagination and filters
router.get('/',
  verifyToken,
  validateListCategories,
  handleValidationErrors,
  CategoriesHandler.listCategories
);

// Update category
router.put('/:id',
  verifyToken,
  validateUpdateCategory,
  handleValidationErrors,
  CategoriesHandler.updateCategory
);

// Delete category (soft delete)
router.delete('/:id',
  verifyToken,
  validateDeleteCategory,
  handleValidationErrors,
  CategoriesHandler.deleteCategory
);

// Restore deleted category
router.post('/:id/restore',
  verifyToken,
  validateGetCategory,
  handleValidationErrors,
  CategoriesHandler.restoreCategory
);

// Get category with PowerBI data
router.get('/:id/powerbi',
  verifyToken,
  validateGetCategory,
  handleValidationErrors,
  CategoriesHandler.getCategoryWithPowerBi
);

module.exports = router;
