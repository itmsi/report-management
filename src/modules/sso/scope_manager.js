const { successResponse, errorResponse } = require('../../utils/response');
const { Logger } = require('../../utils/logger');

class ScopeAuthorizationManager {
  constructor() {
    this.scopeDefinitions = new Map();
    this.scopeHierarchy = new Map();
    this.scopePermissions = new Map();
    this.initializeDefaultScopes();
  }

  initializeDefaultScopes() {
    // Define available scopes with their permissions
    this.scopeDefinitions.set('read', {
      name: 'read',
      description: 'Read access to user data and resources',
      permissions: ['read:profile', 'read:email', 'read:basic_info'],
      level: 1
    });

    this.scopeDefinitions.set('write', {
      name: 'write',
      description: 'Write access to user data and resources',
      permissions: ['write:profile', 'write:email', 'write:basic_info'],
      level: 2
    });

    this.scopeDefinitions.set('delete', {
      name: 'delete',
      description: 'Delete access to user data and resources',
      permissions: ['delete:profile', 'delete:email', 'delete:basic_info'],
      level: 3
    });

    this.scopeDefinitions.set('admin', {
      name: 'admin',
      description: 'Administrative access to all resources',
      permissions: ['admin:all', 'read:all', 'write:all', 'delete:all'],
      level: 4
    });

    this.scopeDefinitions.set('profile', {
      name: 'profile',
      description: 'Access to user profile information',
      permissions: ['read:profile', 'write:profile'],
      level: 1
    });

    this.scopeDefinitions.set('email', {
      name: 'email',
      description: 'Access to user email information',
      permissions: ['read:email', 'write:email'],
      level: 1
    });

    // Define scope hierarchy (higher scopes include lower ones)
    this.scopeHierarchy.set('admin', ['delete', 'write', 'read', 'profile', 'email']);
    this.scopeHierarchy.set('delete', ['write', 'read', 'profile', 'email']);
    this.scopeHierarchy.set('write', ['read', 'profile', 'email']);
    this.scopeHierarchy.set('read', ['profile', 'email']);
    this.scopeHierarchy.set('profile', []);
    this.scopeHierarchy.set('email', []);
  }

  // Validate requested scopes against allowed scopes
  validateScopes(requestedScopes, allowedScopes) {
    if (!Array.isArray(requestedScopes)) {
      requestedScopes = [requestedScopes];
    }

    const invalidScopes = [];
    const validScopes = [];

    for (const scope of requestedScopes) {
      if (!this.scopeDefinitions.has(scope)) {
        invalidScopes.push(scope);
        continue;
      }

      if (allowedScopes.includes(scope)) {
        validScopes.push(scope);
      } else {
        // Check if scope is included in hierarchy
        const hierarchyScopes = this.scopeHierarchy.get(scope) || [];
        const hasHierarchyAccess = hierarchyScopes.some(hScope => allowedScopes.includes(hScope));
        
        if (hasHierarchyAccess) {
          validScopes.push(scope);
        } else {
          invalidScopes.push(scope);
        }
      }
    }

    return {
      valid: validScopes,
      invalid: invalidScopes,
      isValid: invalidScopes.length === 0
    };
  }

  // Get effective permissions for a set of scopes
  getEffectivePermissions(scopes) {
    const permissions = new Set();
    
    for (const scope of scopes) {
      const scopeDef = this.scopeDefinitions.get(scope);
      if (scopeDef) {
        scopeDef.permissions.forEach(permission => permissions.add(permission));
      }
    }

    return Array.from(permissions);
  }

  // Check if user has permission for a specific action
  hasPermission(scopes, requiredPermission) {
    const effectivePermissions = this.getEffectivePermissions(scopes);
    return effectivePermissions.includes(requiredPermission) || 
           effectivePermissions.includes('admin:all');
  }

  // Get scope information
  getScopeInfo(scope) {
    return this.scopeDefinitions.get(scope);
  }

  // Get all available scopes
  getAllScopes() {
    return Array.from(this.scopeDefinitions.values());
  }

  // Check if scope exists
  scopeExists(scope) {
    return this.scopeDefinitions.has(scope);
  }

  // Get scope hierarchy
  getScopeHierarchy(scope) {
    return this.scopeHierarchy.get(scope) || [];
  }

  // API endpoints
  async getScopes(req, res) {
    try {
      const scopes = this.getAllScopes();
      Logger.info('Scopes retrieved', { ip: req.ip });
      return successResponse(res, { scopes }, 'Daftar scope berhasil diambil');

    } catch (error) {
      Logger.error('Error getting scopes', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal mengambil daftar scope', 500);
    }
  }

  async getScopeInfo(req, res) {
    try {
      const { scope } = req.params;
      const clientIP = req.ip || req.connection.remoteAddress;

      if (!scope) {
        return errorResponse(res, 'Scope diperlukan', 400);
      }

      const scopeInfo = this.getScopeInfo(scope);
      if (!scopeInfo) {
        Logger.warn('Scope not found', { scope, ip: clientIP });
        return errorResponse(res, 'Scope tidak ditemukan', 404);
      }

      const response = {
        ...scopeInfo,
        hierarchy: this.getScopeHierarchy(scope)
      };

      Logger.info('Scope info retrieved', { scope, ip: clientIP });
      return successResponse(res, response, 'Informasi scope berhasil diambil');

    } catch (error) {
      Logger.error('Error getting scope info', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal mengambil informasi scope', 500);
    }
  }

  async validateScopesEndpoint(req, res) {
    try {
      const { requested_scopes, allowed_scopes } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;

      if (!requested_scopes || !allowed_scopes) {
        return errorResponse(res, 'Requested scopes dan allowed scopes diperlukan', 400);
      }

      const validation = this.validateScopes(requested_scopes, allowed_scopes);
      
      const response = {
        requested_scopes,
        allowed_scopes,
        valid_scopes: validation.valid,
        invalid_scopes: validation.invalid,
        is_valid: validation.isValid,
        effective_permissions: this.getEffectivePermissions(validation.valid)
      };

      Logger.info('Scopes validated', { 
        requested: requested_scopes.length, 
        valid: validation.valid.length, 
        invalid: validation.invalid.length,
        ip: clientIP 
      });

      return successResponse(res, response, 'Validasi scope berhasil');

    } catch (error) {
      Logger.error('Error validating scopes', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal memvalidasi scope', 500);
    }
  }

  async checkPermission(req, res) {
    try {
      const { scopes, permission } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;

      if (!scopes || !permission) {
        return errorResponse(res, 'Scopes dan permission diperlukan', 400);
      }

      const hasPermission = this.hasPermission(scopes, permission);
      const effectivePermissions = this.getEffectivePermissions(scopes);

      const response = {
        scopes,
        permission,
        has_permission: hasPermission,
        effective_permissions: effectivePermissions
      };

      Logger.info('Permission checked', { 
        scopes: scopes.length, 
        permission, 
        hasPermission,
        ip: clientIP 
      });

      return successResponse(res, response, 'Pengecekan permission berhasil');

    } catch (error) {
      Logger.error('Error checking permission', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal mengecek permission', 500);
    }
  }

  // Middleware for scope-based authorization
  requireScope(requiredScope) {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return errorResponse(res, 'Bearer token diperlukan', 401);
        }

        const token = authHeader.substring(7);
        
        // In a real implementation, you would decode the JWT and get scopes
        // For now, we'll assume scopes are in req.user.scopes
        const userScopes = req.user?.scopes || [];
        
        if (!this.hasPermission(userScopes, requiredScope)) {
          Logger.warn('Insufficient scope', { 
            requiredScope, 
            userScopes, 
            ip: req.ip 
          });
          return errorResponse(res, 'Tidak memiliki permission yang diperlukan', 403);
        }

        next();
      } catch (error) {
        Logger.error('Error in scope middleware', { error: error.message, stack: error.stack });
        return errorResponse(res, 'Error dalam validasi scope', 500);
      }
    };
  }

  // Middleware for multiple scope requirements
  requireAnyScope(requiredScopes) {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return errorResponse(res, 'Bearer token diperlukan', 401);
        }

        const token = authHeader.substring(7);
        const userScopes = req.user?.scopes || [];
        
        const hasAnyScope = requiredScopes.some(scope => this.hasPermission(userScopes, scope));
        
        if (!hasAnyScope) {
          Logger.warn('Insufficient scopes', { 
            requiredScopes, 
            userScopes, 
            ip: req.ip 
          });
          return errorResponse(res, 'Tidak memiliki permission yang diperlukan', 403);
        }

        next();
      } catch (error) {
        Logger.error('Error in scope middleware', { error: error.message, stack: error.stack });
        return errorResponse(res, 'Error dalam validasi scope', 500);
      }
    };
  }

  // Middleware for all scope requirements
  requireAllScopes(requiredScopes) {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return errorResponse(res, 'Bearer token diperlukan', 401);
        }

        const token = authHeader.substring(7);
        const userScopes = req.user?.scopes || [];
        
        const hasAllScopes = requiredScopes.every(scope => this.hasPermission(userScopes, scope));
        
        if (!hasAllScopes) {
          Logger.warn('Insufficient scopes', { 
            requiredScopes, 
            userScopes, 
            ip: req.ip 
          });
          return errorResponse(res, 'Tidak memiliki semua permission yang diperlukan', 403);
        }

        next();
      } catch (error) {
        Logger.error('Error in scope middleware', { error: error.message, stack: error.stack });
        return errorResponse(res, 'Error dalam validasi scope', 500);
      }
    };
  }
}

module.exports = new ScopeAuthorizationManager();
