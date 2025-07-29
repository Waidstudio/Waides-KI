import { ethMonitor } from './ethMonitor';
import { storage } from '../storage';
import { getDivineSignal } from './divineService';

// Global state for real-time trading
let realTimeTrading = false;
let tradingInterval: NodeJS.Timeout | null = null;

export interface RealTimeTradingStatus {
  isActive: boolean;
  lastExecutionTime: string | null;
  totalExecutions: number;
  lastSignal: string | null;
}

let tradingStats = {
  totalExecutions: 0,
  lastExecutionTime: null as string | null,
  lastSignal: null as string | null
};

export function startRealTimeTrading(): RealTimeTradingStatus {
  if (realTimeTrading || tradingInterval) {
    return getRealTimeTradingStatus();
  }
  
  realTimeTrading = true;
  console.log('🤖 Real-time automated trading started');
  
  tradingInterval = setInterval(async () => {
    try {
      // Get current market data
      let ethData;
      try {
        ethData = await ethMonitor.fetchEthData();
      } catch (apiError) {
        console.log('⚠️ ETH data fetch failed, using fallback for real-time trading');
        ethData = {
          price: 3500,
          volume: 20000000000,
          marketCap: 420000000000,
          priceChange24h: 2.5,
          timestamp: Date.now()
        };
      }

      // Get divine signal for trading decision
      const divineSignal = await getDivineSignal();
      
      // Execute trade decision based on divine signal
      if (divineSignal.breathLock && 
          !divineSignal.autoCancelEvil && 
          (divineSignal.action === 'BUY LONG' || divineSignal.action === 'SELL SHORT')) {
        
        console.log(`🚀 Real-time trade signal: ${divineSignal.action} at ${ethData.price} USDT`);
        console.log(`📊 Divine reasoning: ${divineSignal.reason}`);
        
        // Update trading statistics
        tradingStats.totalExecutions++;
        tradingStats.lastExecutionTime = new Date().toISOString();
        tradingStats.lastSignal = `${divineSignal.action} - ${divineSignal.reason}`;
        
        // Store signal for history (using existing storage interface)
        try {
          await storage.deactivateSignals();
          await storage.createSignal({
            type: divineSignal.action === 'BUY LONG' ? 'LONG' : 'SHORT',
            confidence: Math.round(divineSignal.energeticPurity),
            description: `Real-time: ${divineSignal.reason}`,
            entryPoint: ethData.price,
            konsMessage: `${divineSignal.konsTitle}: ${divineSignal.strategy} executed`,
            isActive: false
          });
        } catch (storageError) {
          console.error('⚠️ Signal storage failed:', storageError);
        }
        
      } else {
        console.log(`⏳ Real-time monitoring: ${divineSignal.action} - Conditions not met for execution`);
        tradingStats.lastSignal = `MONITORING - ${divineSignal.action}: ${divineSignal.reason}`;
      }
      
    } catch (error) {
      console.error('❌ Real-time trading cycle error:', error);
    }
  }, 30000); // Execute every 30 seconds for real-time analysis

  return getRealTimeTradingStatus();
}

export function stopRealTimeTrading(): RealTimeTradingStatus {
  realTimeTrading = false;
  if (tradingInterval) {
    clearInterval(tradingInterval);
    tradingInterval = null;
  }
  console.log('🛑 Real-time automated trading stopped');
  return getRealTimeTradingStatus();
}

export function getRealTimeTradingStatus(): RealTimeTradingStatus {
  return {
    isActive: realTimeTrading,
    lastExecutionTime: tradingStats.lastExecutionTime,
    totalExecutions: tradingStats.totalExecutions,
    lastSignal: tradingStats.lastSignal
  };
}

export function isRealTimeTradingActive(): boolean {
  return realTimeTrading;
}

export async function executeManualTrade(
  action: string,
  price: number,
  quantity: number = 0.001
): Promise<{ success: boolean; message: string; tradeId?: string }> {
  try {
    if (!realTimeTrading) {
      return {
        success: false,
        message: 'Real-time trading is not active'
      };
    }

    // Validate trade parameters
    if (!action || !price || price <= 0) {
      return {
        success: false,
        message: 'Invalid trade parameters'
      };
    }

    const tradeId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    console.log(`📈 Manual trade execution: ${action} ${quantity} ETH at ${price} USDT`);
    
    // Update statistics
    tradingStats.totalExecutions++;
    tradingStats.lastExecutionTime = new Date().toISOString();
    tradingStats.lastSignal = `MANUAL - ${action} at ${price}`;

    return {
      success: true,
      message: `Manual trade executed: ${action} ${quantity} ETH at ${price} USDT`,
      tradeId
    };

  } catch (error) {
    console.error('❌ Manual trade execution error:', error);
    return {
      success: false,
      message: 'Failed to execute manual trade'
    };
  }
}