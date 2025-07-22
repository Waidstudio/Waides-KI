// waidBotEngineRunner.ts

import { makeWaidDecision, executeDecision, analyzeWithKonsLang } from '../services/waidBotEngine';
import { fetchETHMarketData, fetchDivineSignal } from '../services/marketSources';
import { logWaidEvent } from '../utils/logger';
// import { storeDecisionHistory } from '../utils/waidMemory';
import { KonsLangSymbol } from '../types/konslangTypes';
import { ETHPrice, WaidDecision } from '../types/waidTypes';

// Optional: Config
const AUTO_TRADING_ENABLED = true; // you can make this dynamic later

export async function runWaidBotCycle() {
  try {
    logWaidEvent('🌀 WaidBot cycle started...');

    // Step 1: Get real-time data
    const ethData: ETHPrice = await fetchETHMarketData();
    const divineSignal = await fetchDivineSignal();

    // Step 2: Analyze ETH + Divine Signal using KonsLang
    const konsLangSymbols: KonsLangSymbol[] = analyzeWithKonsLang(ethData, divineSignal);

    // Step 3: Let WaidBot think
    const decision: WaidDecision = await makeWaidDecision(konsLangSymbols, ethData);

    // Step 4: Store memory of decision
    // storeDecisionHistory(decision);

    // Step 5: Optional Execution
    if (AUTO_TRADING_ENABLED && decision.action !== 'HOLD') {
      const result = await executeDecision(decision);
      logWaidEvent(`✅ Action Executed: ${decision.action} | Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    } else {
      logWaidEvent(`🧘 No action taken. Decision: ${decision.action}`);
    }

    logWaidEvent('🌀 WaidBot cycle completed.\n');
  } catch (error: any) {
    logWaidEvent(`❌ Error in WaidBot cycle: ${error.message}`);
  }
}