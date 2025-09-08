const { successResponse, errorResponse } = require('../../utils/response');
const { generateUUID, hashPassword } = require('../../utils/sso');
const { Logger } = require('../../utils/logger');

class ClientRegistrationHandler {
  constructor() {
    this.registeredClients = new Map();
    this.pendingRegistrations = new Map();
    this.initializeDefaultClients();
  }

  initializeDefaultClients() {
    // Default clients untuk testing
    this.registeredClients.set('test_client', {
      id: 'test_client',
      secret: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // test_secret
      name: 'Test Client Application',
      description: 'Default test client for development',
      redirectUris: ['http://localhost:3001/callback', 'http://localhost:3002/callback'],
      scopes: ['read', 'write'],
      isActive: true,
      createdAt: new Date(),
      lastUsed: null,
      allowedOrigins: ['http://localhost:3001', 'http://localhost:3002'],
      tokenExpiry: 3600, // 1 hour
      refreshTokenExpiry: 604800, // 7 days
      maxConcurrentSessions: 5,
      rateLimitPerMinute: 60,
      securityLevel: 'standard',
      contactEmail: 'admin@example.com',
      website: 'http://localhost:3001',
      logoUrl: null,
      termsAccepted: true,
      privacyPolicyAccepted: true
    });
  }

  // Register new client
  async registerClient(req, res) {
    try {
      const {
        name,
        description,
        redirect_uris,
        scopes,
        contact_email,
        website,
        logo_url,
        terms_accepted,
        privacy_policy_accepted
      } = req.body;

      const clientIP = req.ip || req.connection.remoteAddress;

      // Validation
      if (!name || !redirect_uris || !Array.isArray(redirect_uris) || redirect_uris.length === 0) {
        return errorResponse(res, 'Name dan redirect URIs diperlukan', 400);
      }

      if (!terms_accepted || !privacy_policy_accepted) {
        return errorResponse(res, 'Terms dan privacy policy harus diterima', 400);
      }

      if (!contact_email || !this.isValidEmail(contact_email)) {
        return errorResponse(res, 'Contact email tidak valid', 400);
      }

      // Generate client credentials
      const clientId = this.generateClientId(name);
      const clientSecret = this.generateClientSecret();
      const hashedSecret = await hashPassword(clientSecret);

      // Validate redirect URIs
      const validRedirectUris = this.validateRedirectUris(redirect_uris);
      if (validRedirectUris.length === 0) {
        return errorResponse(res, 'Tidak ada redirect URI yang valid', 400);
      }

      // Validate scopes
      const validScopes = this.validateScopes(scopes || ['read']);

      // Create client object
      const client = {
        id: clientId,
        secret: hashedSecret,
        name: name.trim(),
        description: description?.trim() || '',
        redirectUris: validRedirectUris,
        scopes: validScopes,
        isActive: true,
        createdAt: new Date(),
        lastUsed: null,
        allowedOrigins: this.extractOrigins(validRedirectUris),
        tokenExpiry: 3600, // Default 1 hour
        refreshTokenExpiry: 604800, // Default 7 days
        maxConcurrentSessions: 5, // Default
        rateLimitPerMinute: 60, // Default
        securityLevel: 'standard', // Default
        contactEmail: contact_email,
        website: website?.trim() || null,
        logoUrl: logo_url?.trim() || null,
        termsAccepted: terms_accepted,
        privacyPolicyAccepted: privacy_policy_accepted,
        registrationIP: clientIP,
        status: 'pending' // Needs admin approval
      };

      // Store client (in production, save to database)
      this.registeredClients.set(clientId, client);

      Logger.info('Client registration successful', {
        clientId,
        name,
        contactEmail: contact_email,
        redirectUris: validRedirectUris.length,
        scopes: validScopes,
        ip: clientIP
      });

      return successResponse(res, {
        client_id: clientId,
        client_secret: clientSecret, // Only returned once
        name: client.name,
        description: client.description,
        redirect_uris: client.redirectUris,
        scopes: client.scopes,
        status: client.status,
        created_at: client.createdAt.toISOString(),
        expires_in: 0 // No expiry for client credentials
      }, 'Client berhasil didaftarkan');

    } catch (error) {
      Logger.error('Error during client registration', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal mendaftarkan client', 500);
    }
  }

  // Get client information
  async getClient(req, res) {
    try {
      const { client_id } = req.params;
      const clientIP = req.ip || req.connection.remoteAddress;

      if (!client_id) {
        return errorResponse(res, 'Client ID diperlukan', 400);
      }

      const client = this.registeredClients.get(client_id);
      if (!client) {
        Logger.warn('Client not found', { client_id, ip: clientIP });
        return errorResponse(res, 'Client tidak ditemukan', 404);
      }

      // Return client info without secret
      const clientInfo = {
        client_id: client.id,
        name: client.name,
        description: client.description,
        redirect_uris: client.redirectUris,
        scopes: client.scopes,
        is_active: client.isActive,
        created_at: client.createdAt.toISOString(),
        last_used: client.lastUsed?.toISOString() || null,
        contact_email: client.contactEmail,
        website: client.website,
        logo_url: client.logoUrl,
        security_level: client.securityLevel,
        status: client.status
      };

      Logger.info('Client info retrieved', { client_id, ip: clientIP });
      return successResponse(res, clientInfo, 'Informasi client berhasil diambil');

    } catch (error) {
      Logger.error('Error getting client info', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal mengambil informasi client', 500);
    }
  }

  // List all clients (admin only)
  async listClients(req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const clientIP = req.ip || req.connection.remoteAddress;

      let clients = Array.from(this.registeredClients.values());

      // Filter by status
      if (status) {
        clients = clients.filter(client => client.status === status);
      }

      // Search by name or description
      if (search) {
        const searchLower = search.toLowerCase();
        clients = clients.filter(client => 
          client.name.toLowerCase().includes(searchLower) ||
          client.description.toLowerCase().includes(searchLower) ||
          client.contactEmail.toLowerCase().includes(searchLower)
        );
      }

      // Sort by creation date (newest first)
      clients.sort((a, b) => b.createdAt - a.createdAt);

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedClients = clients.slice(startIndex, endIndex);

      // Format response
      const formattedClients = paginatedClients.map(client => ({
        client_id: client.id,
        name: client.name,
        description: client.description,
        redirect_uris: client.redirectUris,
        scopes: client.scopes,
        is_active: client.isActive,
        created_at: client.createdAt.toISOString(),
        last_used: client.lastUsed?.toISOString() || null,
        contact_email: client.contactEmail,
        website: client.website,
        security_level: client.securityLevel,
        status: client.status
      }));

      const response = {
        clients: formattedClients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: clients.length,
          pages: Math.ceil(clients.length / limit)
        }
      };

      Logger.info('Clients list retrieved', { 
        total: clients.length, 
        page: parseInt(page), 
        limit: parseInt(limit),
        ip: clientIP 
      });

      return successResponse(res, response, 'Daftar client berhasil diambil');

    } catch (error) {
      Logger.error('Error listing clients', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal mengambil daftar client', 500);
    }
  }

  // Update client
  async updateClient(req, res) {
    try {
      const { client_id } = req.params;
      const {
        name,
        description,
        redirect_uris,
        scopes,
        contact_email,
        website,
        logo_url,
        is_active,
        security_level
      } = req.body;

      const clientIP = req.ip || req.connection.remoteAddress;

      const client = this.registeredClients.get(client_id);
      if (!client) {
        Logger.warn('Client not found for update', { client_id, ip: clientIP });
        return errorResponse(res, 'Client tidak ditemukan', 404);
      }

      // Update fields if provided
      if (name) client.name = name.trim();
      if (description !== undefined) client.description = description.trim();
      if (redirect_uris) {
        const validRedirectUris = this.validateRedirectUris(redirect_uris);
        if (validRedirectUris.length === 0) {
          return errorResponse(res, 'Tidak ada redirect URI yang valid', 400);
        }
        client.redirectUris = validRedirectUris;
        client.allowedOrigins = this.extractOrigins(validRedirectUris);
      }
      if (scopes) {
        client.scopes = this.validateScopes(scopes);
      }
      if (contact_email && this.isValidEmail(contact_email)) {
        client.contactEmail = contact_email;
      }
      if (website !== undefined) client.website = website?.trim() || null;
      if (logo_url !== undefined) client.logoUrl = logo_url?.trim() || null;
      if (is_active !== undefined) client.isActive = is_active;
      if (security_level && ['standard', 'high', 'critical'].includes(security_level)) {
        client.securityLevel = security_level;
      }

      client.updatedAt = new Date();

      Logger.info('Client updated', { client_id, ip: clientIP });

      return successResponse(res, {
        client_id: client.id,
        name: client.name,
        description: client.description,
        redirect_uris: client.redirectUris,
        scopes: client.scopes,
        is_active: client.isActive,
        security_level: client.securityLevel,
        updated_at: client.updatedAt.toISOString()
      }, 'Client berhasil diperbarui');

    } catch (error) {
      Logger.error('Error updating client', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal memperbarui client', 500);
    }
  }

  // Delete client
  async deleteClient(req, res) {
    try {
      const { client_id } = req.params;
      const clientIP = req.ip || req.connection.remoteAddress;

      const client = this.registeredClients.get(client_id);
      if (!client) {
        Logger.warn('Client not found for deletion', { client_id, ip: clientIP });
        return errorResponse(res, 'Client tidak ditemukan', 404);
      }

      // Soft delete - mark as inactive
      client.isActive = false;
      client.deletedAt = new Date();

      Logger.info('Client deleted', { client_id, ip: clientIP });

      return successResponse(res, {
        client_id: client.id,
        deleted_at: client.deletedAt.toISOString()
      }, 'Client berhasil dihapus');

    } catch (error) {
      Logger.error('Error deleting client', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal menghapus client', 500);
    }
  }

  // Helper methods
  generateClientId(name) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
    return `${nameSlug}_${timestamp}_${random}`;
  }

  generateClientSecret() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  validateRedirectUris(uris) {
    const validUris = [];
    for (const uri of uris) {
      try {
        const url = new URL(uri);
        // Only allow http/https schemes
        if (['http:', 'https:'].includes(url.protocol)) {
          validUris.push(uri);
        }
      } catch (error) {
        Logger.warn('Invalid redirect URI', { uri, error: error.message });
      }
    }
    return validUris;
  }

  validateScopes(scopes) {
    const allowedScopes = ['read', 'write', 'delete', 'admin', 'profile', 'email'];
    return scopes.filter(scope => allowedScopes.includes(scope));
  }

  extractOrigins(redirectUris) {
    const origins = [];
    for (const uri of redirectUris) {
      try {
        const url = new URL(uri);
        origins.push(`${url.protocol}//${url.host}`);
      } catch (error) {
        Logger.warn('Error extracting origin', { uri, error: error.message });
      }
    }
    return [...new Set(origins)]; // Remove duplicates
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get client for validation (internal use)
  getClientForValidation(clientId) {
    return this.registeredClients.get(clientId);
  }
}

module.exports = new ClientRegistrationHandler();
