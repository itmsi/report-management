const express = require('express');
const router = express.Router();
const PowerBiHandler = require('./handler');
const {
  validateCreatePowerBi,
  validateUpdatePowerBi,
  validateGetPowerBi,
  validateDeletePowerBi,
  validateListPowerBi,
  handleValidationErrors
} = require('./validation');
const { verifyToken } = require('../../middlewares');
const { handleFileUpload } = require('../../middlewares/fileUpload');

// Create PowerBI report
router.post('/',
  verifyToken,
  handleFileUpload,
  validateCreatePowerBi,
  handleValidationErrors,
  PowerBiHandler.createPowerBi
);

// Get PowerBI report by ID
router.get('/:id',
  verifyToken,
  validateGetPowerBi,
  handleValidationErrors,
  PowerBiHandler.getPowerBi
);

// List PowerBI reports with pagination and filters
router.get('/',
  verifyToken,
  validateListPowerBi,
  handleValidationErrors,
  PowerBiHandler.listPowerBi
);

// Update PowerBI report
router.put('/:id',
  verifyToken,
  handleFileUpload,
  validateUpdatePowerBi,
  handleValidationErrors,
  PowerBiHandler.updatePowerBi
);

// Delete PowerBI report (soft delete)
router.delete('/:id',
  verifyToken,
  validateDeletePowerBi,
  handleValidationErrors,
  PowerBiHandler.deletePowerBi
);

// Restore deleted PowerBI report
router.post('/:id/restore',
  verifyToken,
  validateGetPowerBi,
  handleValidationErrors,
  PowerBiHandler.restorePowerBi
);

// Get PowerBI reports by category
router.get('/category/:category_id',
  verifyToken,
  PowerBiHandler.getPowerBiByCategory
);

// Get PowerBI statistics
router.get('/stats/overview',
  verifyToken,
  PowerBiHandler.getPowerBiStats
);

module.exports = router;
