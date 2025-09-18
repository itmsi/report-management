const CategoriesHandler = require('./handler');

module.exports = {
  createCategory: CategoriesHandler.createCategory.bind(CategoriesHandler),
  getCategory: CategoriesHandler.getCategory.bind(CategoriesHandler),
  listCategories: CategoriesHandler.listCategories.bind(CategoriesHandler),
  updateCategory: CategoriesHandler.updateCategory.bind(CategoriesHandler),
  deleteCategory: CategoriesHandler.deleteCategory.bind(CategoriesHandler),
  restoreCategory: CategoriesHandler.restoreCategory.bind(CategoriesHandler),
  getCategoryWithPowerBi: CategoriesHandler.getCategoryWithPowerBi.bind(CategoriesHandler),
  getCategoriesPost: CategoriesHandler.getCategoriesPost.bind(CategoriesHandler),
  createCategoryPost: CategoriesHandler.createCategoryPost.bind(CategoriesHandler),
};