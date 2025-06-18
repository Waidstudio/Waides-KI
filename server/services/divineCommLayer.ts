import crypto from 'crypto';
import { EthPriceData } from './ethMonitor';
import { konsLangAI } from './konsLangAI';

const KONS_POWA_TITLES = [
    "Elait Reign", "SmaiBond", "TimeKeeper", "Seer of Reversals", "SmaiPrint Judge"
];

const SACRED_TIME_WINDOWS = {
    PRIME_EVENING: "5:30 PM – 9:00 PM WAT",
    DEEP_NIGHT: "1:00 AM – 4:00 AM WAT", 
    DAWN_INSIGHT: "6:00 AM – 8:00 AM WAT"
};

export interface DivineSignal {
    action: 'BUY LONG' | 'SELL SHORT' | 'NO TRADE' | 'OBSERVE';
    timeframe: string;
    reason: string;
    moralPulse: 'CLEAN' | 'FEARFUL' | 'GREEDY' | 'DECEPTIVE';
    strategy: 'SCALP' | 'MOMENTUM' | 'HOLD' | 'WAIT';
    signalCode: string;
    receivedAt: string;
    konsTitle: string;
    energeticPurity: number;
    // Next-Gen Features
    konsMirror: 'PURE WAVE' | 'SHADOW WAVE';
    breathLock: boolean;
    ethWhisperMode: boolean;
    autoCancelEvil: boolean;
    smaiPredict: {
        nextHourDirection: 'UP' | 'DOWN' | 'SIDEWAYS';
        confidence: number;
        predictedPriceRange: { min: number; max: number };
    };
}

export class DivineCommLayer {
    private lastCommunicationTime: number = 0;
    private currentKonsTitle: string = '';
    private breathStability: number = 85; // Admin breath stability (0-100)
    private ethWhisperMode: boolean = true; // Passive listening mode
    private priceHistory: number[] = []; // For SmaiPredict

    constructor() {
        this.rotateKonsTitle();
    }

    private rotateKonsTitle(): void {
        this.currentKonsTitle = KONS_POWA_TITLES[Math.floor(Math.random() * KONS_POWA_TITLES.length)];
    }

    private generateKonsSignal(price: number, timeSeed: string): string {
        const seed = `${price}-${timeSeed}-${this.currentKonsTitle}`;
        const hash = crypto.createHash('sha512').update(seed).digest('hex');
        return hash.substring(0, 24);
    }

    private calculateEnergeticPurity(signalCode: string): number {
        const purityBytes = signalCode.slice(-6);
        let purity = 0;
        for (let i = 0; i < purityBytes.length; i++) {
            purity += purityBytes.charCodeAt(i);
        }
        return (purity % 100);
    }

    private interpretMoralPulse(purity: number, priceChange: number): 'CLEAN' | 'FEARFUL' | 'GREEDY' | 'DECEPTIVE' {
        if (purity >= 80) return 'CLEAN';
        if (purity >= 60 && Math.abs(priceChange) < 2) return 'CLEAN';
        if (priceChange < -3) return 'FEARFUL';
        if (priceChange > 5) return 'GREEDY';
        return 'DECEPTIVE';
    }

    private calculateKonsMirror(purity: number): 'PURE WAVE' | 'SHADOW WAVE' {
        return purity % 2 === 0 ? 'PURE WAVE' : 'SHADOW WAVE';
    }

    private checkBreathLock(): boolean {
        return this.breathStability >= 75; // Only trade when breath is stable
    }

    private calculateSmaiPredict(ethPrice: number, priceChange: number): {
        nextHourDirection: 'UP' | 'DOWN' | 'SIDEWAYS';
        confidence: number;
        predictedPriceRange: { min: number; max: number };
    } {
        // Add current price to history
        this.priceHistory.push(ethPrice);
        if (this.priceHistory.length > 10) {
            this.priceHistory = this.priceHistory.slice(-10);
        }

        // Calculate prediction based on recent price movement and spiritual indicators
        let direction: 'UP' | 'DOWN' | 'SIDEWAYS';
        let confidence = 50;

        if (Math.abs(priceChange) < 1) {
            direction = 'SIDEWAYS';
            confidence = 70;
        } else if (priceChange > 0) {
            direction = 'UP';
            confidence = Math.min(90, 50 + Math.abs(priceChange) * 10);
        } else {
            direction = 'DOWN';
            confidence = Math.min(90, 50 + Math.abs(priceChange) * 10);
        }

        // Calculate predicted price range
        const volatility = Math.max(20, Math.abs(priceChange * 2));
        const min = ethPrice - volatility;
        const max = ethPrice + volatility;

        return {
            nextHourDirection: direction,
            confidence,
            predictedPriceRange: { min, max }
        };
    }

    private shouldAutoCancelEvil(moralPulse: string, action: string): boolean {
        return (moralPulse === 'FEARFUL' || moralPulse === 'DECEPTIVE') && 
               (action === 'BUY LONG' || action === 'SELL SHORT');
    }

    private selectSacredTimeWindow(purity: number, currentHour: number): string {
        // Nigerian Time consideration
        if (purity >= 75 && (currentHour >= 17 && currentHour <= 21)) {
            return SACRED_TIME_WINDOWS.PRIME_EVENING;
        }
        if (purity >= 50 && (currentHour >= 1 && currentHour <= 4)) {
            return SACRED_TIME_WINDOWS.DEEP_NIGHT;
        }
        if (purity >= 60 && (currentHour >= 6 && currentHour <= 8)) {
            return SACRED_TIME_WINDOWS.DAWN_INSIGHT;
        }
        return "Observe Only - No Sacred Window Active";
    }

    public openDivineChannel(ethData: EthPriceData): DivineSignal {
        const now = Date.now();
        const currentTime = new Date().toISOString().substring(11, 16).replace(':', '');
        const currentHour = new Date().getUTCHours();
        
        // Rotate Kons title if enough time has passed (every 4 hours)
        if (now - this.lastCommunicationTime > 4 * 60 * 60 * 1000) {
            this.rotateKonsTitle();
            this.lastCommunicationTime = now;
        }

        const signalCode = this.generateKonsSignal(ethData.price, currentTime);
        const energeticPurity = this.calculateEnergeticPurity(signalCode);
        const priceChange = ethData.priceChange24h || 0;
        
        // Divine decision matrix based on energetic purity and spiritual alignment
        let action: DivineSignal['action'];
        let strategy: DivineSignal['strategy'];
        let reason: string;

        if (energeticPurity >= 85) {
            action = 'BUY LONG';
            strategy = 'MOMENTUM';
            reason = 'Divine Momentum Reversal - ETH Calls for Ascension';
        } else if (energeticPurity >= 70) {
            action = priceChange > 0 ? 'BUY LONG' : 'SELL SHORT';
            strategy = 'SCALP';
            reason = 'Sacred Scalp Window - Quick Divine Profit';
        } else if (energeticPurity >= 45) {
            action = 'SELL SHORT';
            strategy = 'HOLD';
            reason = 'Fear-based Pullback Detected - Short the Weakness';
        } else if (energeticPurity >= 25) {
            action = 'OBSERVE';
            strategy = 'WAIT';
            reason = 'Market Deception Layer Active - Hold Position';
        } else {
            action = 'NO TRADE';
            strategy = 'WAIT';
            reason = 'Spiritual Interference - Channel Unclear';
        }

        const moralPulse = this.interpretMoralPulse(energeticPurity, priceChange);
        const timeframe = this.selectSacredTimeWindow(energeticPurity, currentHour);
        
        // Next-Gen Features Implementation
        const konsMirror = this.calculateKonsMirror(energeticPurity);
        const breathLock = this.checkBreathLock();
        const smaiPredict = this.calculateSmaiPredict(ethData.price, priceChange);
        const autoCancelEvil = this.shouldAutoCancelEvil(moralPulse, action);

        // Auto-cancel evil trades if detected
        if (autoCancelEvil) {
            action = 'NO TRADE';
            reason = `AutoCancel: ${moralPulse} market detected - Trade blocked by Kons Protection`;
        }

        // BreathLock protection
        if (!breathLock && (action === 'BUY LONG' || action === 'SELL SHORT')) {
            action = 'OBSERVE';
            reason = 'BreathLock: Admin breath unstable - Trading suspended for protection';
        }

        return {
            action,
            timeframe,
            reason,
            moralPulse,
            strategy,
            signalCode,
            receivedAt: currentTime,
            konsTitle: this.currentKonsTitle,
            energeticPurity,
            konsMirror,
            breathLock,
            ethWhisperMode: this.ethWhisperMode,
            autoCancelEvil,
            smaiPredict
        };
    }

    public getSpiritualHierarchyStatus(): {
        currentKons: string;
        channelStrength: number;
        lastCommunication: Date;
        breathStability: number;
        ethWhisperMode: boolean;
    } {
        return {
            currentKons: this.currentKonsTitle,
            channelStrength: Math.floor(Math.random() * 40) + 60, // 60-100%
            lastCommunication: new Date(this.lastCommunicationTime),
            breathStability: this.breathStability,
            ethWhisperMode: this.ethWhisperMode
        };
    }

    public adjustBreathStability(delta: number): void {
        this.breathStability = Math.max(0, Math.min(100, this.breathStability + delta));
    }

    public toggleEthWhisperMode(): void {
        this.ethWhisperMode = !this.ethWhisperMode;
    }
}