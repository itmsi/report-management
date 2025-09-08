const PowerBiRepository = require('./postgre_repository');
const { pagination } = require('../../utils');
const { uploadToMinio } = require('../../config/minio');
const { generateFileName, getContentType } = require('../../middlewares/fileUpload');

class PowerBiHandler {
  async createPowerBi(req, res) {
    try {
      const { category_id, title, link, status, description } = req.body;
      const createdBy = req.user?.user_id || null;

      let fileUrl = null;
      
      // Handle file upload if file is provided
      if (req.file) {
        const fileName = generateFileName(req.file.originalname);
        const contentType = getContentType(req.file.originalname);
        
        const uploadResult = await uploadToMinio(fileName, req.file.buffer, contentType);
        
        if (uploadResult.success) {
          fileUrl = uploadResult.url;
        } else {
          return res.status(500).json({
            success: false,
            message: 'Failed to upload file',
            error: uploadResult.error
          });
        }
      }

      const powerBiData = {
        category_id,
        title,
        link,
        status: status || 'active',
        file: fileUrl,
        description,
        created_by: createdBy
      };

      const powerBi = await PowerBiRepository.create(powerBiData);

      res.status(201).json({
        success: true,
        message: 'PowerBI report created successfully',
        data: powerBi
      });
    } catch (error) {
      console.error('Error creating PowerBI report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create PowerBI report',
        error: error.message
      });
    }
  }

  async getPowerBi(req, res) {
    try {
      const { id } = req.params;

      const powerBi = await PowerBiRepository.findById(id);
      if (!powerBi) {
        return res.status(404).json({
          success: false,
          message: 'PowerBI report not found'
        });
      }

      res.json({
        success: true,
        message: 'PowerBI report retrieved successfully',
        data: powerBi
      });
    } catch (error) {
      console.error('Error getting PowerBI report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get PowerBI report',
        error: error.message
      });
    }
  }

  async listPowerBi(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category_id,
        status,
        sort_by,
        sort_order
      } = req.query;

      const filters = {
        search,
        category_id,
        status,
        sort_by,
        sort_order
      };

      const totalCount = await PowerBiRepository.count(filters);
      const powerBiList = await PowerBiRepository.findAll(filters);

      const paginatedData = pagination(powerBiList, page, limit, totalCount);

      res.json({
        success: true,
        message: 'PowerBI reports retrieved successfully',
        ...paginatedData
      });
    } catch (error) {
      console.error('Error listing PowerBI reports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to list PowerBI reports',
        error: error.message
      });
    }
  }

  async updatePowerBi(req, res) {
    try {
      const { id } = req.params;
      const { category_id, title, link, status, description } = req.body;
      const updatedBy = req.user?.user_id || null;

      const existingPowerBi = await PowerBiRepository.findById(id);
      if (!existingPowerBi) {
        return res.status(404).json({
          success: false,
          message: 'PowerBI report not found'
        });
      }

      const updateData = {
        updated_by: updatedBy
      };

      if (category_id !== undefined) updateData.category_id = category_id;
      if (title !== undefined) updateData.title = title;
      if (link !== undefined) updateData.link = link;
      if (status !== undefined) updateData.status = status;
      if (description !== undefined) updateData.description = description;

      // Handle file upload if new file is provided
      if (req.file) {
        const fileName = generateFileName(req.file.originalname);
        const contentType = getContentType(req.file.originalname);
        
        const uploadResult = await uploadToMinio(fileName, req.file.buffer, contentType);
        
        if (uploadResult.success) {
          updateData.file = uploadResult.url;
        } else {
          return res.status(500).json({
            success: false,
            message: 'Failed to upload file',
            error: uploadResult.error
          });
        }
      }

      const powerBi = await PowerBiRepository.update(id, updateData);

      res.json({
        success: true,
        message: 'PowerBI report updated successfully',
        data: powerBi
      });
    } catch (error) {
      console.error('Error updating PowerBI report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update PowerBI report',
        error: error.message
      });
    }
  }

  async deletePowerBi(req, res) {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.user_id || null;

      const existingPowerBi = await PowerBiRepository.findById(id);
      if (!existingPowerBi) {
        return res.status(404).json({
          success: false,
          message: 'PowerBI report not found'
        });
      }

      await PowerBiRepository.softDelete(id, deletedBy);

      res.json({
        success: true,
        message: 'PowerBI report deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting PowerBI report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete PowerBI report',
        error: error.message
      });
    }
  }

  async restorePowerBi(req, res) {
    try {
      const { id } = req.params;
      const updatedBy = req.user?.user_id || null;

      const powerBi = await PowerBiRepository.restore(id, updatedBy);
      if (!powerBi) {
        return res.status(404).json({
          success: false,
          message: 'PowerBI report not found or already restored'
        });
      }

      res.json({
        success: true,
        message: 'PowerBI report restored successfully',
        data: powerBi
      });
    } catch (error) {
      console.error('Error restoring PowerBI report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to restore PowerBI report',
        error: error.message
      });
    }
  }

  async getPowerBiByCategory(req, res) {
    try {
      const { category_id } = req.params;

      const powerBiList = await PowerBiRepository.findByCategoryId(category_id);

      res.json({
        success: true,
        message: 'PowerBI reports by category retrieved successfully',
        data: powerBiList
      });
    } catch (error) {
      console.error('Error getting PowerBI reports by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get PowerBI reports by category',
        error: error.message
      });
    }
  }

  async getPowerBiStats(req, res) {
    try {
      const stats = await PowerBiRepository.getStats();

      res.json({
        success: true,
        message: 'PowerBI statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error getting PowerBI statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get PowerBI statistics',
        error: error.message
      });
    }
  }
}

module.exports = new PowerBiHandler();
