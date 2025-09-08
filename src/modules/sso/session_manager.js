const { successResponse, errorResponse } = require('../../utils/response');
const { generateUUID } = require('../../utils/sso');
const { Logger } = require('../../utils/logger');

class SessionManager {
  constructor() {
    this.activeSessions = new Map(); // sessionId -> sessionData
    this.userSessions = new Map(); // userId -> Set of sessionIds
    this.clientSessions = new Map(); // clientId -> Set of sessionIds
    this.sessionHistory = new Map(); // sessionId -> history
    this.startCleanupInterval();
  }

  // Create new session
  createSession(userId, clientId, userAgent, ipAddress, scopes = ['read']) {
    const sessionId = generateUUID();
    const now = new Date();
    
    const sessionData = {
      sessionId,
      userId,
      clientId,
      userAgent: userAgent || 'Unknown',
      ipAddress: ipAddress || 'Unknown',
      scopes,
      createdAt: now,
      lastActivity: now,
      expiresAt: new Date(now.getTime() + (24 * 60 * 60 * 1000)), // 24 hours
      isActive: true,
      loginTime: now,
      logoutTime: null,
      refreshCount: 0,
      requestCount: 0
    };

    // Store session
    this.activeSessions.set(sessionId, sessionData);

    // Track user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId).add(sessionId);

    // Track client sessions
    if (!this.clientSessions.has(clientId)) {
      this.clientSessions.set(clientId, new Set());
    }
    this.clientSessions.get(clientId).add(sessionId);

    // Initialize session history
    this.sessionHistory.set(sessionId, [{
      action: 'session_created',
      timestamp: now,
      ipAddress,
      userAgent
    }]);

    Logger.info('Session created', {
      sessionId,
      userId,
      clientId,
      ipAddress,
      userAgent
    });

    return sessionData;
  }

  // Update session activity
  updateSessionActivity(sessionId, ipAddress, userAgent) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    const now = new Date();
    session.lastActivity = now;
    session.requestCount++;

    // Add to history
    if (this.sessionHistory.has(sessionId)) {
      this.sessionHistory.get(sessionId).push({
        action: 'activity_updated',
        timestamp: now,
        ipAddress,
        userAgent
      });
    }

    return true;
  }

  // Refresh session (extend expiry)
  refreshSession(sessionId, ipAddress, userAgent) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    const now = new Date();
    session.lastActivity = now;
    session.refreshCount++;
    session.expiresAt = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // Extend 24 hours

    // Add to history
    if (this.sessionHistory.has(sessionId)) {
      this.sessionHistory.get(sessionId).push({
        action: 'session_refreshed',
        timestamp: now,
        ipAddress,
        userAgent,
        refreshCount: session.refreshCount
      });
    }

    Logger.info('Session refreshed', {
      sessionId,
      userId: session.userId,
      clientId: session.clientId,
      refreshCount: session.refreshCount
    });

    return session;
  }

  // End session
  endSession(sessionId, reason = 'logout', ipAddress, userAgent) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    const now = new Date();
    session.isActive = false;
    session.logoutTime = now;

    // Add to history
    if (this.sessionHistory.has(sessionId)) {
      this.sessionHistory.get(sessionId).push({
        action: 'session_ended',
        timestamp: now,
        reason,
        ipAddress,
        userAgent
      });
    }

    // Remove from active sessions
    this.activeSessions.delete(sessionId);

    // Remove from user sessions
    const userSessions = this.userSessions.get(session.userId);
    if (userSessions) {
      userSessions.delete(sessionId);
      if (userSessions.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }

    // Remove from client sessions
    const clientSessions = this.clientSessions.get(session.clientId);
    if (clientSessions) {
      clientSessions.delete(sessionId);
      if (clientSessions.size === 0) {
        this.clientSessions.delete(session.clientId);
      }
    }

    Logger.info('Session ended', {
      sessionId,
      userId: session.userId,
      clientId: session.clientId,
      reason,
      duration: now - session.createdAt
    });

    return session;
  }

  // End all sessions for user
  endAllUserSessions(userId, reason = 'logout_all', ipAddress, userAgent) {
    const userSessions = this.userSessions.get(userId);
    if (!userSessions) {
      return [];
    }

    const endedSessions = [];
    for (const sessionId of userSessions) {
      const session = this.endSession(sessionId, reason, ipAddress, userAgent);
      if (session) {
        endedSessions.push(session);
      }
    }

    Logger.info('All user sessions ended', {
      userId,
      sessionsEnded: endedSessions.length,
      reason
    });

    return endedSessions;
  }

  // End all sessions for client
  endAllClientSessions(clientId, reason = 'client_logout', ipAddress, userAgent) {
    const clientSessions = this.clientSessions.get(clientId);
    if (!clientSessions) {
      return [];
    }

    const endedSessions = [];
    for (const sessionId of clientSessions) {
      const session = this.endSession(sessionId, reason, ipAddress, userAgent);
      if (session) {
        endedSessions.push(session);
      }
    }

    Logger.info('All client sessions ended', {
      clientId,
      sessionsEnded: endedSessions.length,
      reason
    });

    return endedSessions;
  }

  // Get session information
  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  // Get user sessions
  getUserSessions(userId) {
    const userSessions = this.userSessions.get(userId);
    if (!userSessions) {
      return [];
    }

    const sessions = [];
    for (const sessionId of userSessions) {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  // Get client sessions
  getClientSessions(clientId) {
    const clientSessions = this.clientSessions.get(clientId);
    if (!clientSessions) {
      return [];
    }

    const sessions = [];
    for (const sessionId of clientSessions) {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  // Get session history
  getSessionHistory(sessionId) {
    return this.sessionHistory.get(sessionId) || [];
  }

  // Check if session is valid
  isSessionValid(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.isActive) {
      return false;
    }

    const now = new Date();
    if (session.expiresAt < now) {
      this.endSession(sessionId, 'expired');
      return false;
    }

    return true;
  }

  // Get session statistics
  getSessionStats() {
    const now = new Date();
    let activeCount = 0;
    let expiredCount = 0;
    let totalRequests = 0;
    let totalRefreshes = 0;

    for (const session of this.activeSessions.values()) {
      if (session.isActive) {
        activeCount++;
        totalRequests += session.requestCount;
        totalRefreshes += session.refreshCount;
      } else {
        expiredCount++;
      }
    }

    return {
      active_sessions: activeCount,
      expired_sessions: expiredCount,
      total_users: this.userSessions.size,
      total_clients: this.clientSessions.size,
      total_requests: totalRequests,
      total_refreshes: totalRefreshes,
      timestamp: now.toISOString()
    };
  }

  // Cleanup expired sessions
  cleanupExpiredSessions() {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.expiresAt < now) {
        this.endSession(sessionId, 'expired');
        cleanedCount++;
      }
    }

    // Cleanup old history (keep for 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    for (const [sessionId, history] of this.sessionHistory.entries()) {
      const filteredHistory = history.filter(entry => entry.timestamp > thirtyDaysAgo);
      if (filteredHistory.length === 0) {
        this.sessionHistory.delete(sessionId);
      } else {
        this.sessionHistory.set(sessionId, filteredHistory);
      }
    }

    if (cleanedCount > 0) {
      Logger.info('Expired sessions cleaned up', { cleanedCount });
    }

    return cleanedCount;
  }

  // Start cleanup interval
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // API endpoints
  async getSessionInfo(req, res) {
    try {
      const { session_id } = req.params;
      const clientIP = req.ip || req.connection.remoteAddress;

      if (!session_id) {
        return errorResponse(res, 'Session ID diperlukan', 400);
      }

      const session = this.getSession(session_id);
      if (!session) {
        Logger.warn('Session not found', { session_id, ip: clientIP });
        return errorResponse(res, 'Session tidak ditemukan', 404);
      }

      const sessionInfo = {
        session_id: session.sessionId,
        user_id: session.userId,
        client_id: session.clientId,
        user_agent: session.userAgent,
        ip_address: session.ipAddress,
        scopes: session.scopes,
        created_at: session.createdAt.toISOString(),
        last_activity: session.lastActivity.toISOString(),
        expires_at: session.expiresAt.toISOString(),
        is_active: session.isActive,
        login_time: session.loginTime.toISOString(),
        logout_time: session.logoutTime?.toISOString() || null,
        refresh_count: session.refreshCount,
        request_count: session.requestCount
      };

      Logger.info('Session info retrieved', { session_id, ip: clientIP });
      return successResponse(res, sessionInfo, 'Informasi session berhasil diambil');

    } catch (error) {
      Logger.error('Error getting session info', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal mengambil informasi session', 500);
    }
  }

  async getUserSessions(req, res) {
    try {
      const { user_id } = req.params;
      const clientIP = req.ip || req.connection.remoteAddress;

      if (!user_id) {
        return errorResponse(res, 'User ID diperlukan', 400);
      }

      const sessions = this.getUserSessions(user_id);
      const sessionInfos = sessions.map(session => ({
        session_id: session.sessionId,
        client_id: session.clientId,
        user_agent: session.userAgent,
        ip_address: session.ipAddress,
        created_at: session.createdAt.toISOString(),
        last_activity: session.lastActivity.toISOString(),
        expires_at: session.expiresAt.toISOString(),
        is_active: session.isActive,
        refresh_count: session.refreshCount,
        request_count: session.requestCount
      }));

      Logger.info('User sessions retrieved', { user_id, count: sessions.length, ip: clientIP });
      return successResponse(res, {
        user_id,
        sessions: sessionInfos,
        total: sessions.length
      }, 'Sessions user berhasil diambil');

    } catch (error) {
      Logger.error('Error getting user sessions', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal mengambil sessions user', 500);
    }
  }

  async getSessionStats(req, res) {
    try {
      const stats = this.getSessionStats();
      Logger.info('Session stats retrieved', { ip: req.ip });
      return successResponse(res, stats, 'Statistik session berhasil diambil');

    } catch (error) {
      Logger.error('Error getting session stats', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal mengambil statistik session', 500);
    }
  }

  async endSessionEndpoint(req, res) {
    try {
      const { session_id } = req.params;
      const { reason = 'manual_logout' } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      if (!session_id) {
        return errorResponse(res, 'Session ID diperlukan', 400);
      }

      const session = this.endSession(session_id, reason, clientIP, userAgent);
      if (!session) {
        Logger.warn('Session not found for ending', { session_id, ip: clientIP });
        return errorResponse(res, 'Session tidak ditemukan', 404);
      }

      Logger.info('Session ended via API', { session_id, reason, ip: clientIP });
      return successResponse(res, {
        session_id: session.sessionId,
        ended_at: session.logoutTime.toISOString(),
        reason
      }, 'Session berhasil diakhiri');

    } catch (error) {
      Logger.error('Error ending session', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal mengakhiri session', 500);
    }
  }
}

module.exports = new SessionManager();
