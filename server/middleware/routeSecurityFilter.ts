/**
 * Route Security Filter Middleware
 * Prevents exposure of sensitive admin routes to Ki Chat and regular users
 * Provides audit logging for route access attempts
 */

export interface SecurityContext {
  isAuthenticated: boolean;
  userRole?: string;
  permissions: string[];
  userId?: number;
  sessionId?: string;
}

export interface RouteAccessAttempt {
  timestamp: Date;
  userId?: number;
  sessionId?: string;
  requestedRoute: string;
  allowed: boolean;
  reason: string;
  userRole?: string;
  permissions: string[];
}

export class RouteSecurityFilter {
  private adminRoutePatterns = [
    '/admin',
    '/admin-panel',
    '/config',
    '/expanded-config',
    '/payment-admin',
    '/sms-config',
    '/kons-powa',
    '/admin-login'
  ];

  private accessLog: RouteAccessAttempt[] = [];

  /**
   * Check if route is admin-only and should be filtered from Ki Chat responses
   */
  public isAdminRoute(path: string): boolean {
    return this.adminRoutePatterns.some(pattern => 
      path.startsWith(pattern) || path === pattern
    );
  }

  /**
   * Filter routes for Ki Chat - removes admin routes completely
   */
  public filterRoutesForKiChat(routes: string[], context: SecurityContext): string[] {
    const filteredRoutes = routes.filter(route => {
      const isAdmin = this.isAdminRoute(route);
      
      // Log access attempt if admin route requested
      if (isAdmin) {
        this.logAccessAttempt({
          timestamp: new Date(),
          userId: context.userId,
          sessionId: context.sessionId,
          requestedRoute: route,
          allowed: false,
          reason: 'Admin route filtered from Ki Chat',
          userRole: context.userRole,
          permissions: context.permissions
        });
      }

      return !isAdmin;
    });

    return filteredRoutes;
  }

  /**
   * Check if user has access to specific route
   */
  public hasRouteAccess(path: string, context: SecurityContext): boolean {
    // Admin routes require admin role
    if (this.isAdminRoute(path)) {
      const hasAdminAccess = context.userRole === 'admin' || 
                            context.userRole === 'super_admin' ||
                            context.permissions.includes('admin_access');
      
      this.logAccessAttempt({
        timestamp: new Date(),
        userId: context.userId,
        sessionId: context.sessionId,
        requestedRoute: path,
        allowed: hasAdminAccess,
        reason: hasAdminAccess ? 'Admin access granted' : 'Insufficient admin privileges',
        userRole: context.userRole,
        permissions: context.permissions
      });

      return hasAdminAccess;
    }

    // Public routes are always accessible
    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/learning'];
    if (publicRoutes.includes(path)) {
      return true;
    }

    // Protected routes require authentication
    if (!context.isAuthenticated) {
      this.logAccessAttempt({
        timestamp: new Date(),
        userId: context.userId,
        sessionId: context.sessionId,
        requestedRoute: path,
        allowed: false,
        reason: 'Authentication required',
        userRole: context.userRole,
        permissions: context.permissions
      });
      return false;
    }

    // Trading routes require specific permissions
    const tradingRoutes = ['/waidbot-engine', '/strategy-autogen', '/enhanced-waidbot'];
    if (tradingRoutes.includes(path)) {
      const hasTradingAccess = context.permissions.includes('control_trading');
      
      this.logAccessAttempt({
        timestamp: new Date(),
        userId: context.userId,
        sessionId: context.sessionId,
        requestedRoute: path,
        allowed: hasTradingAccess,
        reason: hasTradingAccess ? 'Trading permission granted' : 'Missing control_trading permission',
        userRole: context.userRole,
        permissions: context.permissions
      });

      return hasTradingAccess;
    }

    // Default: authenticated users can access most routes
    return true;
  }

  /**
   * Generate safe route suggestions for Ki Chat
   */
  public getSafeRouteSuggestions(query: string, context: SecurityContext): string[] {
    const allRoutes = [
      '/', '/login', '/register', '/learning', '/portal', '/dashboard', 
      '/wallet', '/forum', '/profile', '/waidbot', '/waidbot-pro',
      '/market-storytelling', '/voice-command', '/biometric-trading',
      '/dream-vision', '/vision-spirit', '/spiritual-recall', '/seasonal-rebirth',
      '/sigil-layer', '/shadow-defense', '/reincarnation', '/eth-empath-guardian',
      '/meta-guardian', '/full-engine', '/ml-lifecycle', '/risk-backtesting',
      '/gateway', '/api-docs', '/live-data'
    ];

    // Add trading routes if user has permissions
    if (context.permissions.includes('control_trading')) {
      allRoutes.push('/waidbot-engine', '/strategy-autogen', '/enhanced-waidbot');
    }

    // Filter out admin routes completely
    const safeRoutes = this.filterRoutesForKiChat(allRoutes, context);

    // Filter by access permissions
    return safeRoutes.filter(route => this.hasRouteAccess(route, context));
  }

  /**
   * Log route access attempt
   */
  private logAccessAttempt(attempt: RouteAccessAttempt): void {
    this.accessLog.push(attempt);
    
    // Keep only last 1000 entries
    if (this.accessLog.length > 1000) {
      this.accessLog = this.accessLog.slice(-1000);
    }

    // Log to console for monitoring
    if (!attempt.allowed) {
      console.warn(`🚫 Route access denied: ${attempt.requestedRoute} for user ${attempt.userId} (${attempt.reason})`);
    }
  }

  /**
   * Get recent access attempts for audit
   */
  public getAccessLog(limit = 100): RouteAccessAttempt[] {
    return this.accessLog.slice(-limit);
  }

  /**
   * Get security stats
   */
  public getSecurityStats(): {
    totalAttempts: number;
    deniedAttempts: number;
    adminAttempts: number;
    recentDenials: RouteAccessAttempt[];
  } {
    const deniedAttempts = this.accessLog.filter(attempt => !attempt.allowed);
    const adminAttempts = this.accessLog.filter(attempt => this.isAdminRoute(attempt.requestedRoute));
    
    return {
      totalAttempts: this.accessLog.length,
      deniedAttempts: deniedAttempts.length,
      adminAttempts: adminAttempts.length,
      recentDenials: deniedAttempts.slice(-10)
    };
  }

  /**
   * Clear access log (for maintenance)
   */
  public clearAccessLog(): void {
    this.accessLog = [];
    console.log('🧹 Route security access log cleared');
  }
}

export const routeSecurityFilter = new RouteSecurityFilter();