export function logWaidEvent(message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] WAID: ${message}`);
}

export function logError(error: string, context?: string): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR${context ? ` (${context})` : ''}: ${error}`);
}

export function logInfo(message: string): void {
  const timestamp = new Date().toISOString();
  console.info(`[${timestamp}] INFO: ${message}`);
}