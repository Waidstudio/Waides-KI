export interface SystemMetrics {
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
  lastHealthCheck: string;
}

export interface SystemStatus {
  status: 'healthy' | 'warning' | 'critical';
  services: {
    database: 'online' | 'offline' | 'degraded';
    ethMonitor: 'online' | 'offline' | 'degraded';
    tradingBots: 'online' | 'offline' | 'degraded';
    aiSystems: 'online' | 'offline' | 'degraded';
  };
  alerts: Array<{
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
}

// System monitoring state
let systemMetrics: SystemMetrics = {
  uptime: 0,
  memoryUsage: { used: 0, total: 0, percentage: 0 },
  cpuUsage: 0,
  activeConnections: 0,
  requestsPerMinute: 0,
  errorRate: 0,
  lastHealthCheck: new Date().toISOString()
};

let requestCount = 0;
let errorCount = 0;
let startTime = Date.now();

// Track requests for monitoring
export function trackRequest(): void {
  requestCount++;
}

export function trackError(): void {
  errorCount++;
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
  const now = Date.now();
  const uptimeSeconds = Math.floor((now - startTime) / 1000);
  
  // Get memory usage (Node.js process memory)
  const memUsage = process.memoryUsage();
  const totalMemory = memUsage.heapTotal + memUsage.external + memUsage.arrayBuffers;
  const usedMemory = memUsage.heapUsed;
  
  // Calculate requests per minute (last minute approximation)
  const requestsPerMinute = Math.round(requestCount / Math.max(1, uptimeSeconds / 60));
  
  // Calculate error rate percentage
  const errorRate = requestCount > 0 ? Math.round((errorCount / requestCount) * 100) : 0;
  
  // Simulate CPU usage (in production, use a proper CPU monitoring library)
  const cpuUsage = Math.random() * 20 + 10; // 10-30% for simulation
  
  systemMetrics = {
    uptime: uptimeSeconds,
    memoryUsage: {
      used: usedMemory,
      total: totalMemory,
      percentage: Math.round((usedMemory / totalMemory) * 100)
    },
    cpuUsage: Math.round(cpuUsage),
    activeConnections: Math.floor(Math.random() * 50) + 20, // Simulated
    requestsPerMinute,
    errorRate,
    lastHealthCheck: new Date().toISOString()
  };
  
  return systemMetrics;
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const metrics = await getSystemMetrics();
  
  // Determine overall system status
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  const alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string; timestamp: string }> = [];
  
  // Check memory usage
  if (metrics.memoryUsage.percentage > 90) {
    status = 'critical';
    alerts.push({
      level: 'error',
      message: `High memory usage: ${metrics.memoryUsage.percentage}%`,
      timestamp: new Date().toISOString()
    });
  } else if (metrics.memoryUsage.percentage > 75) {
    status = status === 'healthy' ? 'warning' : status;
    alerts.push({
      level: 'warning',
      message: `Elevated memory usage: ${metrics.memoryUsage.percentage}%`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check CPU usage
  if (metrics.cpuUsage > 80) {
    status = 'critical';
    alerts.push({
      level: 'error',
      message: `High CPU usage: ${metrics.cpuUsage}%`,
      timestamp: new Date().toISOString()
    });
  } else if (metrics.cpuUsage > 60) {
    status = status === 'healthy' ? 'warning' : status;
    alerts.push({
      level: 'warning',
      message: `Elevated CPU usage: ${metrics.cpuUsage}%`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check error rate
  if (metrics.errorRate > 10) {
    status = 'critical';
    alerts.push({
      level: 'error',
      message: `High error rate: ${metrics.errorRate}%`,
      timestamp: new Date().toISOString()
    });
  } else if (metrics.errorRate > 5) {
    status = status === 'healthy' ? 'warning' : status;
    alerts.push({
      level: 'warning',
      message: `Elevated error rate: ${metrics.errorRate}%`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Service status checks (simplified - in production, implement actual health checks)
  const services = {
    database: 'online' as const,
    ethMonitor: 'online' as const,
    tradingBots: 'online' as const,
    aiSystems: 'online' as const
  };
  
  // Add info alert if system is healthy
  if (status === 'healthy' && alerts.length === 0) {
    alerts.push({
      level: 'info',
      message: 'All systems operating normally',
      timestamp: new Date().toISOString()
    });
  }
  
  return {
    status,
    services,
    alerts
  };
}

export async function performHealthCheck(): Promise<{
  healthy: boolean;
  checks: Record<string, { status: 'pass' | 'fail'; message: string }>;
}> {
  const checks: Record<string, { status: 'pass' | 'fail'; message: string }> = {};
  let allHealthy = true;
  
  // Memory check
  const metrics = await getSystemMetrics();
  checks.memory = {
    status: metrics.memoryUsage.percentage < 90 ? 'pass' : 'fail',
    message: `Memory usage: ${metrics.memoryUsage.percentage}%`
  };
  if (checks.memory.status === 'fail') allHealthy = false;
  
  // CPU check
  checks.cpu = {
    status: metrics.cpuUsage < 80 ? 'pass' : 'fail',
    message: `CPU usage: ${metrics.cpuUsage}%`
  };
  if (checks.cpu.status === 'fail') allHealthy = false;
  
  // Error rate check
  checks.errorRate = {
    status: metrics.errorRate < 10 ? 'pass' : 'fail',
    message: `Error rate: ${metrics.errorRate}%`
  };
  if (checks.errorRate.status === 'fail') allHealthy = false;
  
  // Uptime check
  checks.uptime = {
    status: metrics.uptime > 60 ? 'pass' : 'fail', // At least 1 minute uptime
    message: `Uptime: ${Math.floor(metrics.uptime / 60)} minutes`
  };
  if (checks.uptime.status === 'fail') allHealthy = false;
  
  return {
    healthy: allHealthy,
    checks
  };
}

// Reset monitoring counters
export function resetMetrics(): void {
  requestCount = 0;
  errorCount = 0;
  startTime = Date.now();
}

// Get formatted system information
export function getSystemInfo(): {
  platform: string;
  nodeVersion: string;
  pid: number;
  uptime: number;
} {
  return {
    platform: process.platform,
    nodeVersion: process.version,
    pid: process.pid,
    uptime: Math.floor(process.uptime())
  };
}