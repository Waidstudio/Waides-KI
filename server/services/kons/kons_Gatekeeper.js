/**
 * Kons_Gatekeeper - Access Control and Filter Module
 * Filters anything that enters or exits Konsai's realm
 */

export function kons_Gatekeeper(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  const gatekeeperState = previousState.gatekeeper_state || {
    security_level: 'NORMAL',
    filtered_requests: [],
    trusted_sources: [],
    last_security_scan: 0
  };
  
  function performSecurityScan(userMessage, marketData) {
    const scanResults = {
      message_security: analyzeMessageSecurity(userMessage),
      data_integrity: analyzeDataIntegrity(marketData),
      source_verification: verifySourceAuthenticity(marketData),
      temporal_validation: validateTemporalConsistency(currentTime)
    };
    
    return scanResults;
  }
  
  function analyzeMessageSecurity(message) {
    const security = {
      threat_level: 'SAFE',
      issues: [],
      recommendations: []
    };
    
    const lowerMessage = message.toLowerCase();
    
    // Check for malicious patterns
    const maliciousPatterns = [
      'execute', 'delete', 'drop', 'truncate', 'inject', 
      'script', 'eval', 'system', 'admin', 'password'
    ];
    
    const foundMalicious = maliciousPatterns.filter(pattern => 
      lowerMessage.includes(pattern)
    );
    
    if (foundMalicious.length > 0) {
      security.threat_level = 'HIGH';
      security.issues.push({
        type: 'MALICIOUS_PATTERNS',
        patterns: foundMalicious,
        severity: 'HIGH'
      });
      security.recommendations.push('Block message processing');
    }
    
    // Check for social engineering
    const socialEngineering = [
      'urgent', 'immediately', 'secret', 'don\'t tell',
      'override security', 'bypass', 'emergency access'
    ];
    
    const foundSocial = socialEngineering.filter(pattern =>
      lowerMessage.includes(pattern)
    );
    
    if (foundSocial.length >= 2) {
      security.threat_level = security.threat_level === 'SAFE' ? 'MEDIUM' : security.threat_level;
      security.issues.push({
        type: 'SOCIAL_ENGINEERING',
        patterns: foundSocial,
        severity: 'MEDIUM'
      });
      security.recommendations.push('Verify user intent');
    }
    
    // Check message length (potential DoS)
    if (message.length > 10000) {
      security.threat_level = 'MEDIUM';
      security.issues.push({
        type: 'EXCESSIVE_LENGTH',
        length: message.length,
        severity: 'MEDIUM'
      });
      security.recommendations.push('Truncate message');
    }
    
    return security;
  }
  
  function analyzeDataIntegrity(marketData) {
    const integrity = {
      status: 'VALID',
      issues: [],
      confidence: 100
    };
    
    if (!marketData) {
      integrity.status = 'INVALID';
      integrity.confidence = 0;
      integrity.issues.push({
        type: 'NO_DATA',
        description: 'Market data is null or undefined'
      });
      return integrity;
    }
    
    // Check for required fields
    const requiredFields = ['price', 'volume', 'change24h'];
    const missingFields = requiredFields.filter(field => !marketData[field]);
    
    if (missingFields.length > 0) {
      integrity.confidence -= missingFields.length * 20;
      integrity.issues.push({
        type: 'MISSING_FIELDS',
        fields: missingFields
      });
    }
    
    // Check for suspicious values
    if (marketData.price && (marketData.price < 0 || marketData.price > 100000)) {
      integrity.status = 'SUSPICIOUS';
      integrity.confidence -= 30;
      integrity.issues.push({
        type: 'SUSPICIOUS_PRICE',
        value: marketData.price
      });
    }
    
    if (marketData.volume && marketData.volume < 0) {
      integrity.status = 'INVALID';
      integrity.confidence -= 40;
      integrity.issues.push({
        type: 'INVALID_VOLUME',
        value: marketData.volume
      });
    }
    
    if (marketData.change24h && Math.abs(marketData.change24h) > 50) {
      integrity.status = 'SUSPICIOUS';
      integrity.confidence -= 25;
      integrity.issues.push({
        type: 'EXTREME_CHANGE',
        value: marketData.change24h
      });
    }
    
    return integrity;
  }
  
  function verifySourceAuthenticity(marketData) {
    const verification = {
      source_trusted: true,
      authenticity_score: 85,
      verification_issues: []
    };
    
    // Check data freshness
    if (marketData && marketData.timestamp) {
      const dataAge = currentTime - marketData.timestamp;
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      if (dataAge > maxAge) {
        verification.authenticity_score -= 20;
        verification.verification_issues.push({
          type: 'STALE_DATA',
          age: dataAge,
          max_age: maxAge
        });
      }
    }
    
    // Check for data consistency patterns
    if (marketData && marketData.price && marketData.volume) {
      const priceVolumeRatio = marketData.price / marketData.volume;
      
      // Suspicious if ratio is extremely high or low
      if (priceVolumeRatio > 1000 || priceVolumeRatio < 0.0001) {
        verification.authenticity_score -= 15;
        verification.verification_issues.push({
          type: 'SUSPICIOUS_RATIO',
          ratio: priceVolumeRatio
        });
      }
    }
    
    if (verification.authenticity_score < 60) {
      verification.source_trusted = false;
    }
    
    return verification;
  }
  
  function validateTemporalConsistency(timestamp) {
    const validation = {
      temporal_valid: true,
      issues: []
    };
    
    // Check if timestamp is reasonable
    const now = Date.now();
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
    const oneHourFuture = now + (60 * 60 * 1000);
    
    if (timestamp < oneYearAgo) {
      validation.temporal_valid = false;
      validation.issues.push({
        type: 'TOO_OLD',
        timestamp: timestamp,
        description: 'Timestamp is more than one year old'
      });
    }
    
    if (timestamp > oneHourFuture) {
      validation.temporal_valid = false;
      validation.issues.push({
        type: 'FUTURE_TIMESTAMP',
        timestamp: timestamp,
        description: 'Timestamp is in the future'
      });
    }
    
    return validation;
  }
  
  function generateAccessDecision(scanResults) {
    const decision = {
      access_granted: true,
      security_level: 'NORMAL',
      restrictions: [],
      reasoning: []
    };
    
    // Message security evaluation
    if (scanResults.message_security.threat_level === 'HIGH') {
      decision.access_granted = false;
      decision.security_level = 'BLOCKED';
      decision.reasoning.push('High threat level in message detected');
      return decision;
    }
    
    if (scanResults.message_security.threat_level === 'MEDIUM') {
      decision.security_level = 'RESTRICTED';
      decision.restrictions.push('Limited processing capabilities');
      decision.reasoning.push('Medium threat level requires restrictions');
    }
    
    // Data integrity evaluation
    if (scanResults.data_integrity.status === 'INVALID') {
      decision.restrictions.push('No trading decisions allowed');
      decision.reasoning.push('Invalid market data detected');
    }
    
    if (scanResults.data_integrity.confidence < 70) {
      decision.restrictions.push('High uncertainty warnings required');
      decision.reasoning.push('Low confidence in data integrity');
    }
    
    // Source verification evaluation
    if (!scanResults.source_verification.source_trusted) {
      decision.restrictions.push('External data verification required');
      decision.reasoning.push('Source authenticity questionable');
    }
    
    // Temporal validation evaluation
    if (!scanResults.temporal_validation.temporal_valid) {
      decision.restrictions.push('Temporal data correction needed');
      decision.reasoning.push('Temporal inconsistency detected');
    }
    
    return decision;
  }
  
  function applySecurityFilters(userMessage, marketData, decision) {
    const filteredData = {
      message: userMessage,
      market_data: marketData,
      filters_applied: []
    };
    
    if (decision.security_level === 'BLOCKED') {
      filteredData.message = "[BLOCKED BY SECURITY]";
      filteredData.market_data = null;
      filteredData.filters_applied.push('COMPLETE_BLOCK');
      return filteredData;
    }
    
    if (decision.security_level === 'RESTRICTED') {
      // Filter potentially dangerous words
      const dangerousWords = ['execute', 'delete', 'override', 'bypass'];
      let filteredMessage = userMessage;
      
      dangerousWords.forEach(word => {
        filteredMessage = filteredMessage.replace(new RegExp(word, 'gi'), '[FILTERED]');
      });
      
      filteredData.message = filteredMessage;
      filteredData.filters_applied.push('MESSAGE_SANITIZATION');
    }
    
    // Apply data filters based on restrictions
    if (decision.restrictions.includes('No trading decisions allowed')) {
      if (filteredData.market_data) {
        filteredData.market_data = {
          ...filteredData.market_data,
          trading_disabled: true
        };
      }
      filteredData.filters_applied.push('TRADING_BLOCK');
    }
    
    return filteredData;
  }
  
  function updateGatekeeperState(scanResults, decision) {
    const newState = {
      security_level: decision.security_level,
      filtered_requests: gatekeeperState.filtered_requests.slice(-50), // Keep last 50
      trusted_sources: gatekeeperState.trusted_sources,
      last_security_scan: currentTime,
      scan_statistics: {
        total_scans: (gatekeeperState.scan_statistics?.total_scans || 0) + 1,
        blocked_requests: (gatekeeperState.scan_statistics?.blocked_requests || 0) + 
                         (decision.access_granted ? 0 : 1),
        security_incidents: (gatekeeperState.scan_statistics?.security_incidents || 0) +
                           (scanResults.message_security.threat_level === 'HIGH' ? 1 : 0)
      }
    };
    
    // Add current request to filtered requests log
    newState.filtered_requests.push({
      timestamp: currentTime,
      security_level: decision.security_level,
      access_granted: decision.access_granted,
      restrictions: decision.restrictions.length
    });
    
    return newState;
  }
  
  const scanResults = performSecurityScan(userMessage, marketData);
  const accessDecision = generateAccessDecision(scanResults);
  const filteredData = applySecurityFilters(userMessage, marketData, accessDecision);
  const newGatekeeperState = updateGatekeeperState(scanResults, accessDecision);
  
  return {
    kons: "Gatekeeper",
    timestamp: currentTime,
    security_scan: scanResults,
    access_decision: accessDecision,
    filtered_data: filteredData,
    security_status: {
      current_level: accessDecision.security_level,
      access_granted: accessDecision.access_granted,
      restrictions_count: accessDecision.restrictions.length,
      filters_applied: filteredData.filters_applied.length
    },
    gateway_statistics: {
      total_scans: newGatekeeperState.scan_statistics.total_scans,
      blocked_requests: newGatekeeperState.scan_statistics.blocked_requests,
      security_incidents: newGatekeeperState.scan_statistics.security_incidents,
      block_rate: (newGatekeeperState.scan_statistics.blocked_requests / 
                   newGatekeeperState.scan_statistics.total_scans * 100).toFixed(1)
    },
    immediate_actions: {
      proceed_with_processing: accessDecision.access_granted,
      apply_restrictions: accessDecision.restrictions.length > 0,
      security_alert: accessDecision.security_level === 'BLOCKED' ? 'CRITICAL' : 'NORMAL',
      filtered_message: filteredData.message !== userMessage
    },
    state_update: {
      gatekeeper_state: newGatekeeperState
    }
  };
}