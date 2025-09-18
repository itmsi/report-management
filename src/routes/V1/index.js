const express = require('express')
const auth = require('../../modules/auth')
const categories = require('../../modules/categories')
const powerBi = require('../../modules/powerBi')
const dashboard = require('../../modules/dashboard')
const ssoRoutes = require('./sso')
const { verifyToken } = require('../../middlewares')
const { handleFileUpload } = require('../../middlewares/fileUpload')
const { 
  validateGetDashboardData, 
  validateGetRecentActivities, 
  validateGetRecentActivitiesPost,
  handleValidationErrors 
} = require('../../modules/dashboard/validation')

const routing = express();
const API_TAG = '/api';

/* RULE
naming convention endpoint: using plural
*/

// SSO Routes
routing.use(`${API_TAG}`, ssoRoutes)

// Authentication routes
routing.use(`${API_TAG}/auth`, auth)

// Categories routes
routing.post(`${API_TAG}/categories/get`, verifyToken, categories.getCategoriesPost);
routing.post(`${API_TAG}/categories/create`, verifyToken, categories.createCategoryPost);
routing.post(`${API_TAG}/categories/:id/restore`, verifyToken, categories.restoreCategory);
routing.get(`${API_TAG}/categories/:id`, verifyToken, categories.getCategory);
routing.put(`${API_TAG}/categories/:id`, verifyToken, categories.updateCategory);
routing.delete(`${API_TAG}/categories/:id`, verifyToken, categories.deleteCategory);

// PowerBI routes
routing.post(`${API_TAG}/powerbi/get`, verifyToken, powerBi.getPowerBiPost);
routing.post(`${API_TAG}/powerbi/create`, verifyToken, handleFileUpload, powerBi.createPowerBiPost);
routing.post(`${API_TAG}/powerbi`, verifyToken, handleFileUpload, powerBi.createPowerBi);
routing.post(`${API_TAG}/powerbi/:id/restore`, verifyToken, powerBi.restorePowerBi);
routing.get(`${API_TAG}/powerbi`, verifyToken, powerBi.listPowerBi);
routing.get(`${API_TAG}/powerbi/:id`, verifyToken, powerBi.getPowerBi);
routing.get(`${API_TAG}/powerbi/category/:category_id`, verifyToken, powerBi.getPowerBiByCategory);
routing.get(`${API_TAG}/powerbi/stats/overview`, verifyToken, powerBi.getPowerBiStats);
routing.put(`${API_TAG}/powerbi/:id`, verifyToken, handleFileUpload, powerBi.updatePowerBi);
routing.delete(`${API_TAG}/powerbi/:id`, verifyToken, powerBi.deletePowerBi);

// Dashboard routes
routing.post(`${API_TAG}/dashboard`, verifyToken, validateGetDashboardData, handleValidationErrors, dashboard.getDashboardData);
routing.get(`${API_TAG}/dashboard/stats`, verifyToken, dashboard.getDashboardStats);
routing.post(`${API_TAG}/dashboard/stats`, verifyToken, dashboard.getDashboardStatsPost);
routing.get(`${API_TAG}/dashboard/activities`, verifyToken, validateGetRecentActivities, handleValidationErrors, dashboard.getRecentActivities);
routing.post(`${API_TAG}/dashboard/activities`, verifyToken, validateGetRecentActivitiesPost, handleValidationErrors, dashboard.getRecentActivitiesPost);

module.exports = routing;
