import { WaidDecision } from '../types/waidTypes';

// In-memory storage for WAID decisions
let decisionHistory: WaidDecision[] = [];

export function storeDecisionHistory(decision: WaidDecision): void {
  decisionHistory.push({
    ...decision,
    executionStatus: 'PENDING'
  });
  
  // Keep only last 100 decisions
  if (decisionHistory.length > 100) {
    decisionHistory = decisionHistory.slice(-100);
  }
}

export function getDecisionHistory(limit: number = 20): WaidDecision[] {
  return decisionHistory.slice(-limit);
}

export function getLastDecision(): WaidDecision | null {
  return decisionHistory.length > 0 ? decisionHistory[decisionHistory.length - 1] : null;
}

export function updateDecisionStatus(index: number, status: WaidDecision['executionStatus']): void {
  if (index >= 0 && index < decisionHistory.length) {
    decisionHistory[index].executionStatus = status;
  }
}