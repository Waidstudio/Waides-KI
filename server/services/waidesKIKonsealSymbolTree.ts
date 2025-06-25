export interface KonsealSymbol {
  id: string;
  symbol: string;
  source: string;
  tag: string;
  createdAt: Date;
  expiresAt: Date;
  weight: number;
  isActive: boolean;
  metadata: {
    vision?: string;
    timeframe?: string;
    confidence?: number;
    activationCount: number;
    lastActivated?: Date;
  };
}

export interface SymbolTreeStats {
  totalSymbols: number;
  activeSymbols: number;
  expiredSymbols: number;
  sourceDistribution: Record<string, number>;
  averageWeight: number;
  activationRate: number;
}

export class WaidesKIKonsealSymbolTree {
  private symbols: Map<string, KonsealSymbol> = new Map();
  private symbolsByPrefix: Map<string, KonsealSymbol[]> = new Map();
  private history: KonsealSymbol[] = [];
  private maxHistorySize: number = 500;

  /**
   * Add new Konseal symbol to the tree
   */
  addSymbol(
    symbol: string,
    source: string,
    tag: string,
    expiresInHours: number = 6,
    weight: number = 0.5
  ): KonsealSymbol {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
    
    const konsealSymbol: KonsealSymbol = {
      id: this.generateSymbolId(),
      symbol,
      source,
      tag,
      createdAt: now,
      expiresAt,
      weight,
      isActive: true,
      metadata: {
        vision: this.extractVisionFromTag(tag),
        timeframe: this.extractTimeframeFromTag(tag),
        confidence: this.extractConfidenceFromTag(tag),
        activationCount: 0
      }
    };

    this.symbols.set(konsealSymbol.id, konsealSymbol);
    this.addToPrefix(symbol, konsealSymbol);
    this.addToHistory(konsealSymbol);
    
    return konsealSymbol;
  }

  /**
   * Get all active symbols
   */
  getActiveSymbols(): KonsealSymbol[] {
    const now = new Date();
    const activeSymbols: KonsealSymbol[] = [];

    for (const symbol of this.symbols.values()) {
      if (symbol.isActive && symbol.expiresAt > now) {
        activeSymbols.push(symbol);
      } else if (symbol.expiresAt <= now) {
        // Mark expired symbols as inactive
        symbol.isActive = false;
      }
    }

    return activeSymbols.sort((a, b) => b.weight - a.weight);
  }

  /**
   * Get symbols by vision type
   */
  getSymbolsByVision(vision: string): KonsealSymbol[] {
    return this.getActiveSymbols().filter(symbol => 
      symbol.metadata.vision === vision
    );
  }

  /**
   * Get symbols by source
   */
  getSymbolsBySource(source: string): KonsealSymbol[] {
    return this.getActiveSymbols().filter(symbol => 
      symbol.source === source
    );
  }

  /**
   * Get symbols by weight threshold
   */
  getSymbolsByWeight(minWeight: number): KonsealSymbol[] {
    return this.getActiveSymbols().filter(symbol => 
      symbol.weight >= minWeight
    );
  }

  /**
   * Activate symbol (track usage)
   */
  activateSymbol(symbolId: string): boolean {
    const symbol = this.symbols.get(symbolId);
    if (!symbol || !symbol.isActive) return false;

    symbol.metadata.activationCount++;
    symbol.metadata.lastActivated = new Date();
    
    return true;
  }

  /**
   * Deactivate symbol manually
   */
  deactivateSymbol(symbolId: string): boolean {
    const symbol = this.symbols.get(symbolId);
    if (!symbol) return false;

    symbol.isActive = false;
    return true;
  }

  /**
   * Clean expired symbols
   */
  cleanExpiredSymbols(): number {
    const now = new Date();
    let cleanedCount = 0;

    for (const [id, symbol] of this.symbols.entries()) {
      if (symbol.expiresAt <= now) {
        this.symbols.delete(id);
        this.removeFromPrefix(symbol.symbol, symbol);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get symbol statistics
   */
  getSymbolStats(): SymbolTreeStats {
    const now = new Date();
    const allSymbols = Array.from(this.symbols.values());
    const activeSymbols = allSymbols.filter(s => s.isActive && s.expiresAt > now);
    const expiredSymbols = allSymbols.filter(s => s.expiresAt <= now);

    const sourceDistribution: Record<string, number> = {};
    let totalWeight = 0;
    let totalActivations = 0;

    allSymbols.forEach(symbol => {
      sourceDistribution[symbol.source] = (sourceDistribution[symbol.source] || 0) + 1;
      totalWeight += symbol.weight;
      totalActivations += symbol.metadata.activationCount;
    });

    return {
      totalSymbols: allSymbols.length,
      activeSymbols: activeSymbols.length,
      expiredSymbols: expiredSymbols.length,
      sourceDistribution,
      averageWeight: allSymbols.length > 0 ? totalWeight / allSymbols.length : 0,
      activationRate: allSymbols.length > 0 ? totalActivations / allSymbols.length : 0
    };
  }

  /**
   * Get symbol history
   */
  getSymbolHistory(limit: number = 50): KonsealSymbol[] {
    return this.history
      .slice(-limit)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Search symbols by pattern
   */
  searchSymbols(pattern: string): KonsealSymbol[] {
    const regex = new RegExp(pattern, 'i');
    return this.getActiveSymbols().filter(symbol => 
      regex.test(symbol.symbol) || 
      regex.test(symbol.tag) || 
      regex.test(symbol.source)
    );
  }

  /**
   * Get symbols expiring soon
   */
  getExpiringSymbols(withinHours: number = 1): KonsealSymbol[] {
    const now = new Date();
    const threshold = new Date(now.getTime() + withinHours * 60 * 60 * 1000);

    return this.getActiveSymbols().filter(symbol => 
      symbol.expiresAt <= threshold
    );
  }

  /**
   * Generate unique symbol ID
   */
  private generateSymbolId(): string {
    return `KS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract vision from tag
   */
  private extractVisionFromTag(tag: string): string | undefined {
    const visionMatch = tag.match(/vision:(\w+)/);
    return visionMatch ? visionMatch[1] : undefined;
  }

  /**
   * Extract timeframe from tag
   */
  private extractTimeframeFromTag(tag: string): string | undefined {
    const timeframeMatch = tag.match(/(\d+[hd])/);
    return timeframeMatch ? timeframeMatch[1] : undefined;
  }

  /**
   * Extract confidence from tag
   */
  private extractConfidenceFromTag(tag: string): number | undefined {
    const confidenceMatch = tag.match(/confidence:(\d+\.?\d*)/);
    return confidenceMatch ? parseFloat(confidenceMatch[1]) : undefined;
  }

  /**
   * Add symbol to prefix index
   */
  private addToPrefix(symbol: string, konsealSymbol: KonsealSymbol): void {
    const prefix = symbol.charAt(0);
    if (!this.symbolsByPrefix.has(prefix)) {
      this.symbolsByPrefix.set(prefix, []);
    }
    this.symbolsByPrefix.get(prefix)!.push(konsealSymbol);
  }

  /**
   * Remove symbol from prefix index
   */
  private removeFromPrefix(symbol: string, konsealSymbol: KonsealSymbol): void {
    const prefix = symbol.charAt(0);
    const symbols = this.symbolsByPrefix.get(prefix);
    if (symbols) {
      const index = symbols.findIndex(s => s.id === konsealSymbol.id);
      if (index !== -1) {
        symbols.splice(index, 1);
      }
    }
  }

  /**
   * Add symbol to history
   */
  private addToHistory(symbol: KonsealSymbol): void {
    this.history.push(symbol);
    
    // Keep history size manageable
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get symbol by ID
   */
  getSymbolById(id: string): KonsealSymbol | undefined {
    return this.symbols.get(id);
  }

  /**
   * Update symbol weight
   */
  updateSymbolWeight(id: string, newWeight: number): boolean {
    const symbol = this.symbols.get(id);
    if (!symbol) return false;

    symbol.weight = Math.min(Math.max(newWeight, 0), 1);
    return true;
  }

  /**
   * Get most powerful active symbols
   */
  getMostPowerfulSymbols(limit: number = 10): KonsealSymbol[] {
    return this.getActiveSymbols()
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
  }
}