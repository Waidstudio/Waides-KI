interface AppConfiguration {
  appName: string;
  appVersion: string;
  appDescription: string;
  logo: string;
  favicon: string;
  theme: string;
  maintenanceMode: boolean;
  branding: {
    app_name: string;
    logo_url: string;
    favicon_url: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    font_family: string;
    theme_mode: 'light' | 'dark' | 'auto';
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    author: string;
  };
  features: {
    trading_enabled: boolean;
    wallet_enabled: boolean;
    konsai_enabled: boolean;
    analytics_enabled: boolean;
    notifications_enabled: boolean;
    mobile_app_enabled: boolean;
    api_access_enabled: boolean;
    third_party_integrations: boolean;
  };
  layout: {
    navigation_style: 'sidebar' | 'topbar' | 'combined';
    dashboard_layout: 'grid' | 'list' | 'cards';
    show_footer: boolean;
    show_breadcrumbs: boolean;
    compact_mode: boolean;
    full_width: boolean;
  };
  security: {
    two_factor_required: boolean;
    session_timeout: number;
    max_login_attempts: number;
    password_complexity: 'low' | 'medium' | 'high';
    email_verification_required: boolean;
    admin_approval_required: boolean;
  };
  trading: {
    max_position_size: number;
    default_risk_level: string;
    allowed_trading_pairs: string[];
    auto_trading_enabled: boolean;
    stop_loss_enabled: boolean;
    take_profit_enabled: boolean;
  };
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    in_app_notifications: boolean;
    notification_frequency: 'immediate' | 'hourly' | 'daily';
  };
  api: {
    rate_limit_per_minute: number;
    api_version: string;
    cors_enabled: boolean;
    allowed_origins: string[];
    webhook_enabled: boolean;
  };
  maintenance: {
    maintenance_mode: boolean;
    maintenance_message: string;
    maintenance_end_time: string;
    allowed_ips: string[];
  };
}

class AppConfigurationService {
  private config: AppConfiguration = {
    appName: 'Waides KI',
    appVersion: '1.0.0',
    appDescription: 'Advanced AI-powered cryptocurrency trading platform with spiritual intelligence and autonomous wealth management.',
    logo: '/images/waides-logo.png',
    favicon: '/images/favicon.ico',
    theme: 'dark',
    maintenanceMode: false,
    features: {
      trading: true,
      wallet: true,
      admin: true,
      api: true
    },
    seo: {
      title: 'Waides KI - AI Trading Platform',
      description: 'Advanced AI-powered cryptocurrency trading platform with spiritual intelligence and autonomous wealth management.',
      keywords: 'AI trading, cryptocurrency, SmaiSika, blockchain, automated trading, KonsAi',
      author: 'Waides KI Team'
    },
    branding: {
      app_name: 'Waides KI',
      logo_url: '/images/waides-logo.png',
      favicon_url: '/images/favicon.ico',
      primary_color: '#3B82F6',
      secondary_color: '#64748B',
      accent_color: '#10B981',
      background_color: '#1F2937',
      text_color: '#F9FAFB',
      font_family: 'Inter, sans-serif',
      theme_mode: 'dark',
    },
    features: {
      trading_enabled: true,
      wallet_enabled: true,
      konsai_enabled: true,
      analytics_enabled: true,
      notifications_enabled: true,
      mobile_app_enabled: false,
      api_access_enabled: true,
      third_party_integrations: true,
    },
    layout: {
      navigation_style: 'sidebar',
      dashboard_layout: 'cards',
      show_footer: true,
      show_breadcrumbs: true,
      compact_mode: false,
      full_width: false,
    },
    security: {
      two_factor_required: false,
      session_timeout: 3600000, // 1 hour
      max_login_attempts: 5,
      password_complexity: 'medium',
      email_verification_required: true,
      admin_approval_required: false,
    },
    trading: {
      max_position_size: 10000,
      default_risk_level: 'medium',
      allowed_trading_pairs: ['ETH/USDT', 'BTC/USDT'],
      auto_trading_enabled: true,
      stop_loss_enabled: true,
      take_profit_enabled: true,
    },
    notifications: {
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      in_app_notifications: true,
      notification_frequency: 'immediate',
    },
    api: {
      rate_limit_per_minute: 100,
      api_version: 'v1',
      cors_enabled: true,
      allowed_origins: ['*'],
      webhook_enabled: true,
    },
    maintenance: {
      maintenance_mode: false,
      maintenance_message: 'System is under maintenance. Please try again later.',
      maintenance_end_time: '',
      allowed_ips: [],
    },
  };

  getConfiguration(): AppConfiguration {
    return { ...this.config };
  }

  getSection(section: keyof AppConfiguration): any {
    return { ...this.config[section] };
  }

  updateSection(section: keyof AppConfiguration, updates: any): void {
    this.config[section] = {
      ...this.config[section],
      ...updates,
    };
  }

  updateSetting(section: keyof AppConfiguration, key: string, value: any): void {
    if (this.config[section]) {
      (this.config[section] as any)[key] = value;
    }
  }

  resetSection(section: keyof AppConfiguration): void {
    // Reset to default values - would need default config stored separately
    // For now, just keep current values
  }

  uploadLogo(logoData: string): string {
    // In a real implementation, this would save to file system or cloud storage
    const logoUrl = `/uploads/logo-${Date.now()}.png`;
    this.config.branding.logo_url = logoUrl;
    return logoUrl;
  }

  uploadFavicon(faviconData: string): string {
    // In a real implementation, this would save to file system or cloud storage
    const faviconUrl = `/uploads/favicon-${Date.now()}.ico`;
    this.config.branding.favicon_url = faviconUrl;
    return faviconUrl;
  }

  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.branding.app_name || this.config.branding.app_name.length < 2) {
      errors.push('App name must be at least 2 characters long');
    }

    if (this.config.security.session_timeout < 300000) { // 5 minutes minimum
      errors.push('Session timeout must be at least 5 minutes');
    }

    if (this.config.trading.max_position_size <= 0) {
      errors.push('Max position size must be positive');
    }

    if (this.config.api.rate_limit_per_minute <= 0) {
      errors.push('Rate limit must be positive');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  exportConfiguration(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfiguration(configJson: string): { success: boolean; error?: string } {
    try {
      const importedConfig = JSON.parse(configJson);
      
      // Validate the imported configuration structure
      const requiredSections = ['branding', 'features', 'layout', 'security', 'trading', 'notifications', 'api', 'maintenance'];
      for (const section of requiredSections) {
        if (!importedConfig[section]) {
          return { success: false, error: `Missing required section: ${section}` };
        }
      }

      this.config = { ...importedConfig };
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid JSON format' };
    }
  }

  getStats(): any {
    const totalSettings = Object.values(this.config).reduce((total, section) => {
      return total + Object.keys(section).length;
    }, 0);

    const enabledFeatures = Object.values(this.config.features).filter(Boolean).length;
    
    return {
      totalSettings,
      totalSections: Object.keys(this.config).length,
      enabledFeatures,
      maintenanceMode: this.config.maintenance.maintenance_mode,
      themeMode: this.config.branding.theme_mode,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const appConfigurationService = new AppConfigurationService();
export type { AppConfiguration };